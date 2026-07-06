import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ok, fail } from '../../schemas/result'
import { checkSensitiveWords } from '../../utils/sensitiveWords'
import { getClientIp, getUserAgent, lookupIpRegion } from '../../utils/ipRegion'

export default async function (fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // 公开接口：游客提交评论
  app.post('/api/comment', {
    schema: {
      tags: ['评论管理'],
      summary: '提交评论（游客）',
      body: z.object({
        articleId: z.number(),
        nickname: z.string().min(1).max(64),
        email: z.string().email().max(128),
        website: z.string().max(255).optional(),
        content: z.string().min(1).max(2000),
        replyTo: z.number().optional(),
      }),
    },
  }, async (request) => {
    const data = request.body

    // 敏感词检测
    const checkText = `${data.nickname} ${data.content}`
    const sensitiveWords = checkSensitiveWords(checkText)
    if (sensitiveWords.length > 0) {
      return fail(`评论内容包含敏感词，请修改后重新提交`)
    }

    const article = await fastify.prisma.article.findFirst({
      where: { id: data.articleId, isDeleted: 0, status: 1 },
    })
    if (!article) return fail('文章不存在或已下架')

    // 提取客户端 IP、UA 并解析归属地
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    const location = await lookupIpRegion(ip)

    const comment = await fastify.prisma.comment.create({
      data: {
        articleId: data.articleId,
        nickname: data.nickname,
        email: data.email,
        website: data.website,
        content: data.content,
        replyTo: data.replyTo,
        ip,
        userAgent,
        location,
      },
    })
    return ok(comment)
  })

  // 公开接口：获取文章评论
  app.get('/api/article/:id/comments', {
    schema: {
      tags: ['评论管理'],
      summary: '获取文章评论列表',
      params: z.object({ id: z.string() }),
    },
  }, async (request) => {
    const articleId = Number(request.params.id)
    const list = await fastify.prisma.comment.findMany({
      where: { articleId, isDeleted: 0 },
      orderBy: { createdTime: 'desc' },
    })
    return ok(list)
  })

  // 管理接口
  app.post('/api/comment/page', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['评论管理'],
      summary: '分页查询评论',
      security: [{ bearerAuth: [] }],
      body: z.object({
        pageNum: z.number().default(1),
        pageSize: z.number().default(10),
        keyword: z.string().optional(),
        articleId: z.number().optional(),
      }),
    },
  }, async (request) => {
    const { pageNum, pageSize, keyword, articleId } = request.body
    const where: any = {
      isDeleted: 0,
      ...(articleId ? { articleId } : {}),
      ...(keyword ? { OR: [{ nickname: { contains: keyword } }, { content: { contains: keyword } }] } : {}),
    }
    const [list, total] = await Promise.all([
      fastify.prisma.comment.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdTime: 'desc' },
        include: { article: { select: { title: true } } },
      }),
      fastify.prisma.comment.count({ where }),
    ])
    return ok({ list, total })
  })

  app.delete('/api/comment/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['评论管理'],
      summary: '删除评论',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
    },
  }, async (request) => {
    const id = Number(request.params.id)
    await fastify.prisma.comment.update({ where: { id }, data: { isDeleted: 1 } })
    return ok(null)
  })
}
