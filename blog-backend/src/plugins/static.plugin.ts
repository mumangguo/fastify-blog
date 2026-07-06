import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import path from 'path'
import fs from 'fs'

// 静态文件服务，仅用于本地开发访问历史上传的图片（public/uploads）。
// 线上（Vercel）已改用图床上传（见 upload.routes.ts），且 /var/task 只读，
// 故 serverless 环境跳过注册，避免无意义的目录操作。
export default fp(async (fastify: FastifyInstance) => {
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME
  if (isServerless) return

  const root = path.join(__dirname, '../../public/uploads')
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  }
  await fastify.register(import('@fastify/static'), {
    root,
    prefix: '/uploads/',
  })
})
