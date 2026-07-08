// 本地验证：对比官方 ip2region.js 与我重写的纯 Buffer 实现
// 用法: node scripts/test-ipregion.mjs 49.93.194.159

import fs from 'fs'
import path from 'path'

const XDB = path.join(process.cwd(), 'data/ip2region_v4.xdb')

// ---- 我的纯 Buffer 内联实现 ----
const HEADER_LEN = 256
const VROWS = 256, VCOLS = 256, VSIZE = 8
const IDX = 14

function cmpBE_LE(buff, off, ip) {
  for (let i = 0; i < ip.length; i++) {
    const a = ip[i] & 0xff
    const b = buff[off + (ip.length - 1 - i)] & 0xff
    if (a < b) return -1
    if (a > b) return 1
  }
  return 0
}
function parseV4(s) {
  const p = s.split('.', 4)
  const buf = Buffer.alloc(4)
  for (let i = 0; i < 4; i++) {
    const n = parseInt(p[i], 10)
    buf[i] = n
  }
  return buf
}
function mySearch(buf, ipStr) {
  const ip = parseV4(ipStr)
  const idx = ip[0] * VCOLS * VSIZE + ip[1] * VSIZE
  const sPtr = buf.readUInt32LE(HEADER_LEN + idx)
  const ePtr = buf.readUInt32LE(HEADER_LEN + idx + 4)
  if (sPtr === 0 || ePtr === 0) return ''
  const keyBytes = ip.length, subOff = keyBytes * 2
  let l = 0, h = (ePtr - sPtr) / IDX, dLen = 0, dPtr = 0
  while (l <= h) {
    const m = (l + h) >> 1
    const p = sPtr + m * IDX
    if (cmpBE_LE(buf, p, ip) < 0) { h = m - 1 }
    else if (cmpBE_LE(buf, p + keyBytes, ip) > 0) { l = m + 1 }
    else { dLen = buf.readUInt16LE(p + subOff); dPtr = buf.readUInt32LE(p + subOff + 2); break }
  }
  if (dLen === 0) return ''
  return buf.toString('utf-8', dPtr, dPtr + dLen)
}

const target = process.argv[2] || '49.93.194.159'
const xdbBuf = fs.readFileSync(XDB)

// 1) 我的实现
const myRegion = mySearch(xdbBuf, target)
const myFormatted = myRegion.split('|').filter((p, i) => p && p !== '0' && i < 4).join(' ') || '未知'

// 2) 官方包
const { IPv4, loadContentFromFile, newWithBuffer } = await import('ip2region.js')
const cBuffer = loadContentFromFile(XDB)
const searcher = newWithBuffer(IPv4, cBuffer)
const off = await searcher.search(target)
const officialRegion = off ? off.toString('utf-8') : ''

console.log('target     :', target)
console.log('file size  :', xdbBuf.length, 'bytes')
console.log('------------------------------')
console.log('我的 raw    :', JSON.stringify(myRegion))
console.log('官方 raw    :', JSON.stringify(officialRegion))
console.log('------------------------------')
console.log('我的格式化  :', myFormatted)
console.log('------------------------------')
if (myRegion === officialRegion) {
  console.log('✅ PASS：两份实现输出完全一致')
} else {
  console.log('❌ FAIL：输出不一致')
  process.exit(1)
}

// 再多测几个常见 IP
const extras = ['127.0.0.1', '8.8.8.8', '114.114.114.114', '10.0.0.1']
console.log('---- extras ----')
for (const ip of extras) {
  const r = mySearch(xdbBuf, ip)
  const f = r.split('|').filter((p, i) => p && p !== '0' && i < 4).join(' ') || '未知'
  console.log(`  ${ip.padEnd(18)} → ${f}`)
}
