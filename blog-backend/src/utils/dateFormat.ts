/**
 * 将 Date 对象或 ISO 字符串格式化为 yyyy-MM-dd HH:mm:ss
 */
export function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * 将 yyyy-MM-dd HH:mm:ss 字符串解析为 Date 对象
 */
export function parseDate(str: string): Date {
  return new Date(str)
}

/**
 * 递归遍历对象，将所有 Date 实例格式化为 yyyy-MM-dd HH:mm:ss 字符串
 */
export function formatDatesInObject(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date) return formatDate(obj)
  if (Array.isArray(obj)) return obj.map(formatDatesInObject)
  if (typeof obj === 'object') {
    const result: Record<string, any> = {}
    for (const key of Object.keys(obj)) {
      result[key] = formatDatesInObject(obj[key])
    }
    return result
  }
  return obj
}
