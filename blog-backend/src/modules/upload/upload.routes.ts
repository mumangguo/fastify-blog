import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ok, fail } from '../../schemas/result'
import path from 'path'
import fs from 'fs'
import { pipeline } from 'stream/promises'

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
  }, async (request, reply) => {
    const data = await request.file()
    if (!data) return fail('未找到文件')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(data.mimetype)) {
      return fail('只允许上传图片文件')
    }

    const ext = path.extname(data.filename) || '.png'
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2)}${ext}`
    const uploadDir = path.join(__dirname, '../../../public/uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    const filepath = path.join(uploadDir, filename)

    await pipeline(data.file, fs.createWriteStream(filepath))

    const url = `/uploads/${filename}`
    return ok({ url })
  })
}
