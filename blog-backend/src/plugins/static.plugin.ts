import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import path from 'path'
import fs from 'fs'

export default fp(async (fastify: FastifyInstance) => {
  const root = path.join(__dirname, '../../public/uploads')
  // Vercel 上该目录可能未随打包创建，@fastify/static 的 root 不存在会导致注册失败、整个 app 起不来。
  // 先确保目录存在。注意：Vercel Functions 文件系统是临时的，写入不会持久化，上传持久化需另接对象存储。
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  }
  await fastify.register(import('@fastify/static'), {
    root,
    prefix: '/uploads/',
  })
})
