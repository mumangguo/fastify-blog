export interface Result<T = unknown> {
  code: number
  msg: string
  data: T | null
}

export const ok = <T>(data: T, msg = 'success'): Result<T> => ({
  code: 200,
  msg,
  data,
})

export const fail = (msg: string, code = 500): Result<null> => ({
  code,
  msg,
  data: null,
})

export const pageQuerySchema = {
  pageNum: { type: 'number', default: 1 },
  pageSize: { type: 'number', default: 10 },
  keyword: { type: 'string', optional: true },
}
