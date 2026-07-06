import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ok } from '../../schemas/result'

export default async function (fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get('/api/dashboard/stats', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['仪表盘'],
      summary: '获取统计数据',
      security: [{ bearerAuth: [] }],
    },
  }, async () => {
    const [articleCount, categoryCount, tagCount, commentCount] = await Promise.all([
      fastify.prisma.article.count({ where: { isDeleted: 0 } }),
      fastify.prisma.category.count({ where: { isDeleted: 0 } }),
      fastify.prisma.tag.count({ where: { isDeleted: 0 } }),
      fastify.prisma.comment.count({ where: { isDeleted: 0 } }),
    ])
    return ok({ articleCount, categoryCount, tagCount, commentCount })
  })

  app.get('/api/dashboard/trend', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['仪表盘'],
      summary: '获取最近7天文章发布趋势',
      security: [{ bearerAuth: [] }],
    },
  }, async () => {
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }

    const result = await Promise.all(
      dates.map(async (date) => {
        const start = new Date(date)
        const end = new Date(date)
        end.setDate(end.getDate() + 1)
        const count = await fastify.prisma.article.count({
          where: {
            isDeleted: 0,
            createdTime: { gte: start, lt: end },
          },
        })
        return { date, count }
      })
    )
    return ok(result)
  })

  app.get('/api/dashboard/recent-comments', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['仪表盘'],
      summary: '获取最新5条评论',
      security: [{ bearerAuth: [] }],
    },
  }, async () => {
    const list = await fastify.prisma.comment.findMany({
      where: { isDeleted: 0 },
      orderBy: { createdTime: 'desc' },
      take: 5,
      include: { article: { select: { title: true } } },
    })
    return ok(list)
  })
}
