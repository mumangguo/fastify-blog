import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ok, fail } from '../../schemas/result'

export default async function (fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // ========== 公开接口 ==========

  app.post('/api/article/list', {
    schema: {
      tags: ['文章管理'],
      summary: '前台文章列表',
      body: z.object({
        pageNum: z.number().default(1),
        pageSize: z.number().default(10),
        categoryId: z.number().optional(),
        tagId: z.number().optional(),
      }),
    },
  }, async (request) => {
    const { pageNum, pageSize, categoryId, tagId } = request.body
    let articleIds: number[] | undefined
    if (tagId) {
      const rels = await fastify.prisma.articleTag.findMany({
        where: { tagId },
      })
      articleIds = rels.map((r) => r.articleId)
    }
    const where: any = {
      isDeleted: 0,
      status: 1,
      ...(categoryId ? { categoryId } : {}),
      ...(articleIds ? { id: { in: articleIds } } : {}),
    }
    const [list, total] = await Promise.all([
      fastify.prisma.article.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdTime: 'desc' },
        include: { category: true, tags: { include: { tag: true } } },
      }),
      fastify.prisma.article.count({ where }),
    ])
    return ok({ list, total })
  })

  app.get('/api/article/:id', {
    schema: {
      tags: ['文章管理'],
      summary: '文章详情',
      params: z.object({ id: z.string() }),
    },
  }, async (request) => {
    const id = Number(request.params.id)
    const article = await fastify.prisma.article.findFirst({
      where: { id, isDeleted: 0 },
      include: { category: true, tags: { include: { tag: true } }, comments: { where: { isDeleted: 0 }, orderBy: { createdTime: 'desc' } } },
    })
    if (!article) return fail('文章不存在', 404)
    await fastify.prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
    return ok(article)
  })

  app.post('/api/article/search', {
    schema: {
      tags: ['文章管理'],
      summary: '搜索文章',
      body: z.object({
        pageNum: z.number().default(1),
        pageSize: z.number().default(10),
        keyword: z.string().min(1),
      }),
    },
  }, async (request) => {
    const { pageNum, pageSize, keyword } = request.body
    const where: any = {
      isDeleted: 0,
      status: 1,
      OR: [
        { title: { contains: keyword } },
        { summary: { contains: keyword } },
        { content: { contains: keyword } },
      ],
    }
    const [list, total] = await Promise.all([
      fastify.prisma.article.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdTime: 'desc' },
        include: { category: true, tags: { include: { tag: true } } },
      }),
      fastify.prisma.article.count({ where }),
    ])
    return ok({ list, total })
  })

  // ========== 管理接口 ==========

  app.post('/api/article/page', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['文章管理'],
      summary: '后台分页查询文章',
      security: [{ bearerAuth: [] }],
      body: z.object({
        pageNum: z.number().default(1),
        pageSize: z.number().default(10),
        keyword: z.string().optional(),
        categoryId: z.number().optional(),
        status: z.number().optional(),
      }),
    },
  }, async (request) => {
    const { pageNum, pageSize, keyword, categoryId, status } = request.body
    const where: any = {
      isDeleted: 0,
      ...(keyword ? { title: { contains: keyword } } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(status !== undefined ? { status } : {}),
    }
    const [list, total] = await Promise.all([
      fastify.prisma.article.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdTime: 'desc' },
        include: { category: true, tags: { include: { tag: true } } },
      }),
      fastify.prisma.article.count({ where }),
    ])
    return ok({ list, total })
  })

  app.post('/api/article/add', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['文章管理'],
      summary: '新增文章',
      security: [{ bearerAuth: [] }],
      body: z.object({
        title: z.string().min(1).max(200),
        summary: z.string().max(500).optional(),
        coverUrl: z.string().optional(),
        content: z.string().min(1),
        categoryId: z.number(),
        tagIds: z.array(z.number()).default([]),
        status: z.number().default(1),
      }),
    },
  }, async (request) => {
    const { tagIds, ...data } = request.body
    const article = await fastify.prisma.article.create({ data })
    if (tagIds.length > 0) {
      await fastify.prisma.articleTag.createMany({
        data: tagIds.map((tagId) => ({ articleId: article.id, tagId })),
      })
    }
    return ok(article)
  })

  app.put('/api/article/update', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['文章管理'],
      summary: '修改文章',
      security: [{ bearerAuth: [] }],
      body: z.object({
        id: z.number(),
        title: z.string().min(1).max(200),
        summary: z.string().max(500).optional(),
        coverUrl: z.string().optional(),
        content: z.string().min(1),
        categoryId: z.number(),
        tagIds: z.array(z.number()).default([]),
        status: z.number().default(1),
      }),
    },
  }, async (request) => {
    const { id, tagIds, ...data } = request.body
    await fastify.prisma.article.update({ where: { id }, data })
    await fastify.prisma.articleTag.deleteMany({ where: { articleId: id } })
    if (tagIds.length > 0) {
      await fastify.prisma.articleTag.createMany({
        data: tagIds.map((tagId) => ({ articleId: id, tagId })),
      })
    }
    return ok(null)
  })

  app.delete('/api/article/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['文章管理'],
      summary: '删除文章',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
    },
  }, async (request) => {
    const id = Number(request.params.id)
    await fastify.prisma.article.update({ where: { id }, data: { isDeleted: 1 } })
    return ok(null)
  })

  app.put('/api/article/:id/status', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['文章管理'],
      summary: '切换文章状态',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: z.object({ status: z.number() }),
    },
  }, async (request) => {
    const id = Number(request.params.id)
    await fastify.prisma.article.update({
      where: { id },
      data: { status: request.body.status },
    })
    return ok(null)
  })
}
