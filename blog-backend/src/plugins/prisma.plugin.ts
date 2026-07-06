import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

// PrismaClient 在模块顶层实例化，在同一 Vercel 函数实例的多次调用中被复用
// （Node.js 模块缓存机制），避免重复实例化的开销。
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

export default fp(async (fastify: FastifyInstance) => {
  // 不主动调用 $connect()：Prisma 会在首次查询时惰性建立连接，
  // 对 Serverless 冷启动更友好——不占用启动预算，也不阻塞插件注册。
  fastify.decorate('prisma', prisma)

  // Serverless 环境下函数生命周期结束不会稳定触发 onClose，此钩子主要用于
  // 本地开发时 tsx watch 重启前干净关闭连接。
  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect()
  })
})
