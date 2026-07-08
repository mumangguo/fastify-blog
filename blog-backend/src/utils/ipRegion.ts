import path from 'path'

// ip2region.js 是纯 ESM 包，后端编译为 CommonJS，直接顶层 import 会被 tsc 编成 require()，
// 在运行时报 ERR_REQUIRE_ESM。用不会被 tsc 降级的动态 import 惰性加载它。
// （tsconfig module=commonjs 时 tsc 会把普通 import() 也转成 require()，故用 Function 包裹绕过转换。）
const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>

let searcher: any = null

async function getSearcher() {
  if (searcher) return searcher
  const { IPv4, loadContentFromFile, newWithBuffer } = await dynamicImport('ip2region.js')
  const xdbPath = path.join(__dirname, '../../data/ip2region_v4.xdb')
  const cBuffer = loadContentFromFile(xdbPath)
  searcher = newWithBuffer(IPv4, cBuffer)
  return searcher
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
  try {
    const s = await getSearcher()
    const region = await s.search(ip)
    if (!region) return '未知'
    // region 格式: "国家|省份|城市|运营商|国家代码"
    const parts = region.split('|')
    // 过滤掉 "0" 和重复的国家代码，只保留有意义的部分
    const meaningful = (parts as string[]).filter(
      (p: string, i: number) => p && p !== '0' && i < 4
    )
    return meaningful.join(' ') || '未知'
  } catch (e) {
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
