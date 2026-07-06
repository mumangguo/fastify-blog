import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'

/**
 * 匹配 JSON 中的 ISO 日期时间字符串，如 "2024-01-01T00:00:00.000Z"
 * 将其替换为 yyyy-MM-dd HH:mm:ss 格式
 */
const ISO_DATE_REGEX = /"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)"/g

function formatDateString(jsonStr: string): string {
  return jsonStr.replace(ISO_DATE_REGEX, (_match, isoStr: string) => {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return _match
    const pad = (n: number) => String(n).padStart(2, '0')
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    return `"${formatted}"`
  })
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.addHook('onSend', async (request, reply, payload) => {
    const contentType = reply.getHeader('content-type')
    if (typeof contentType !== 'string' || !contentType.includes('application/json')) {
      return payload
    }

    try {
      const str = typeof payload === 'string' ? payload : (payload as any).toString()
      return formatDateString(str)
    } catch {
      return payload
    }
  })
})
