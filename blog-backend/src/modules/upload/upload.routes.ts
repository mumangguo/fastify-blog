import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ok, fail } from '../../schemas/result'

// picgo.net（Chevereto 程序）图床上传。
// 用图床而非本地磁盘：Vercel/Lambda 文件系统是临时只读的，本地写入不持久也不跨实例共享。
const IMG_HOST_ENDPOINT = process.env.IMG_HOST_ENDPOINT || 'https://www.picgo.net/api/1/upload'

export default async function (fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.post('/api/upload', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['文件上传'],
      summary: '上传图片',
      security: [{ bearerAuth: [] }],
      consumes: ['multipart/form-data'],
    },
  }, async (request) => {
    const apiKey = process.env.IMG_HOST_API_KEY
    if (!apiKey) {
      fastify.log.error('缺少 IMG_HOST_API_KEY 环境变量')
      return fail('图床未配置，无法上传')
    }

    const data = await request.file()
    if (!data) return fail('未找到文件')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(data.mimetype)) {
      return fail('只允许上传图片文件')
    }

    // 读取整个文件到内存（@fastify/multipart 的 limits.fileSize 已限制 10MB）
    const buffer = await data.toBuffer()

    // 用原生 FormData + Blob 转发到图床（Node 20+ 内置）。
    // 用 Uint8Array 包裹，避免 Node Buffer 与 DOM BlobPart 的类型不兼容。
    const form = new FormData()
    const bytes = new Uint8Array(buffer)
    form.append('source', new Blob([bytes], { type: data.mimetype }), data.filename)

    let res: Response
    try {
      res = await fetch(IMG_HOST_ENDPOINT, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey },
        body: form,
      })
    } catch (err: any) {
      fastify.log.error({ err }, '图床请求失败')
      return fail('图床连接失败，请稍后重试')
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      fastify.log.error({ status: res.status, text }, '图床返回错误')
      return fail(`图床上传失败（${res.status}）`)
    }

    // Chevereto 响应格式：{ status_code, image: { url, display_url, ... }, status_txt }
    const result: any = await res.json().catch(() => null)
    const url: string | undefined = result?.image?.url || result?.image?.display_url
    if (!url) {
      fastify.log.error({ result }, '图床响应缺少 URL')
      return fail('图床响应异常，未获取到图片地址')
    }

    return ok({ url })
  })
}
