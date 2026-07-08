import fs from 'fs'
import path from 'path'

/**
 * 纯 Node.js 内联实现的 ip2region v2.0 离线查询器。
 *
 * 原来通过 `new Function('m','return import(m)')('ip2region.js')` 动态加载外部包，
 * Vercel serverless 单文件打包下 node_modules 走 VFS 找不到，报 ERR_MODULE_NOT_FOUND。
 * 现在用 fs + Buffer 直接读 xdb 二进制格式：
 *   +------------------------+
 *   | 256 bytes header       |
 *   | 512 KiB vector index   |  (256 x 256 x 8 bytes: int32 startIp + int32 endIp)
 *   | data segments          |  (14 bytes/entry: 4+4+2+4 = startIpBE | endIpBE | dataLen | dataPtr)
 *   +------------------------+
 *
 * IP 字节序（输入）是大端，xdb 索引字节序是小端，比较时要逐字节镜像比对。
 */

// vector index 常量
const HEADER_INFO_LENGTH = 256
const VECTOR_INDEX_ROWS = 256
const VECTOR_INDEX_COLS = 256
const VECTOR_INDEX_SIZE = 8
const IPV4_INDEX_SIZE = 14 // 4 + 4 + 2 + 4

class PreloadedSearcher {
  private buffer: Buffer

  constructor(buffer: Buffer) {
    this.buffer = buffer
  }

  /**
   * 在 vector index 里定位 [sPtr, ePtr)，然后二分查找命中段。
   */
  search(ipStr: string): string {
    const ipBytes = parseIPv4(ipStr)
    const idx = ipBytes[0] * VECTOR_INDEX_COLS * VECTOR_INDEX_SIZE + ipBytes[1] * VECTOR_INDEX_SIZE
    const sPtr = this.buffer.readUInt32LE(HEADER_INFO_LENGTH + idx)
    const ePtr = this.buffer.readUInt32LE(HEADER_INFO_LENGTH + idx + 4)
    if (sPtr === 0 || ePtr === 0) return ''

    const midSize = IPV4_INDEX_SIZE
    const keySize = ipBytes.length
    const subOffset = keySize << 1 // 8
    let l = 0
    let h = (ePtr - sPtr) / midSize
    let dLen = 0
    let dPtr = 0

    while (l <= h) {
      const m = (l + h) >> 1
      const p = sPtr + m * midSize
      // 索引里 startIp / endIp 是小端，与大端 ipBytes 做镜像比对
      // ip < startIp → 目标在左半；ip > endIp → 目标在右半；否则命中
      if (compareBigLittle(this.buffer, p, ipBytes, 0) < 0) {
        h = m - 1
      } else if (compareBigLittle(this.buffer, p + keySize, ipBytes, 0) > 0) {
        l = m + 1
      } else {
        dLen = this.buffer.readUInt16LE(p + subOffset)
        dPtr = this.buffer.readUInt32LE(p + subOffset + 2)
        break
      }
    }

    if (dLen === 0) return ''
    return this.buffer.toString('utf-8', dPtr, dPtr + dLen)
  }
}

/**
 * 把 buff 中 [offset, offset+len) 的小端字节与 ip（大端）逐位镜像比较。
 * 返回 <0 buff小, 0 相等, >0 buff 大。
 */
function compareBigLittle(buff: Buffer, offset: number, ip: Buffer, _ipOffset: number): number {
  // ip 是大端从左读；buff 对应字节从右读（小端）
  for (let i = 0; i < ip.length; i++) {
    const bIp = ip[i] & 0xff
    const bDb = buff[offset + (ip.length - 1 - i)] & 0xff
    if (bIp < bDb) return -1
    if (bIp > bDb) return 1
  }
  return 0
}

function parseIPv4(s: string): Buffer {
  const parts = s.split('.', 4)
  if (parts.length !== 4) throw new Error(`invalid IPv4: ${s}`)
  const buf = Buffer.alloc(4)
  for (let i = 0; i < 4; i++) {
    const n = parseInt(parts[i], 10)
    if (Number.isNaN(n) || n < 0 || n > 255) throw new Error(`invalid IPv4 octet: ${parts[i]}`)
    buf[i] = n
  }
  return buf
}

// 惰性初始化，服务启动 → 首次具体查询触发读文件；进程内共享
let searcherPromise: Promise<PreloadedSearcher> | null = null

function getSearcher(): Promise<PreloadedSearcher> {
  if (searcherPromise) return searcherPromise
  searcherPromise = new Promise<PreloadedSearcher>((resolve, reject) => {
    try {
      const xdbPath = path.join(__dirname, '../../data/ip2region_v4.xdb')
      const buf = fs.readFileSync(xdbPath)
      resolve(new PreloadedSearcher(buf))
    } catch (e) {
      // 读文件失败的都要透出，不再静默吞错
      searcherPromise = null
      reject(e)
    }
  })
  return searcherPromise
}

/**
 * 解析 IP 归属地
 * @param ip IPv4 地址
 * @returns 格式化后的归属地字符串，如 "中国 广东省 深圳市 电信"
 */
export async function lookupIpRegion(ip: string): Promise<string> {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return '本地网络'
  }
  // IPv6 直接返回；当前 v4 数据库不支持 IPv6
  if (ip.includes(':')) return '未知'
  try {
    const s = await getSearcher()
    const region = s.search(ip)
    if (!region) return '未知'
    // region 格式: "国家|省份|城市|运营商|国家代码"。过滤 "0" 和国家代码，保留前 4 段
    const parts = region.split('|')
    const meaningful = parts.filter((p: string, i: number) => p && p !== '0' && i < 4)
    return meaningful.join(' ') || '未知'
  } catch (e) {
    // 文件读取 / 解析错误透出到日志，不静默
    console.error('[lookupIpRegion] 查询失败, ip:', ip, 'error:', e)
    return '未知'
  }
}

/**
 * 从 Fastify request 中提取客户端真实 IP
 */
export function getClientIp(request: any): string {
  const forwarded = request.headers['x-forwarded-for']
  if (forwarded) {
    // x-forwarded-for 可能包含多个 IP，取第一个
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  const realIp = request.headers['x-real-ip']
  if (realIp) return realIp
  return request.ip || '127.0.0.1'
}

/**
 * 从 Fastify request 中提取 User-Agent
 */
export function getUserAgent(request: any): string {
  return request.headers['user-agent'] || ''
}
