import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ok, fail } from '../../schemas/result'

export default async function (fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // 公开接口
  app.get('/api/category/list', {
    schema: { tags: ['分类管理'], summary: '获取分类列表（公开）' },
  }, async () => {
    const list = await fastify.prisma.category.findMany({
      where: { isDeleted: 0 },
      orderBy: { sortOrder: 'asc' },
    })
    return ok(list)
  })

  // 管理接口
  app.post('/api/category/page', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['分类管理'],
      summary: '分页查询分类',
      security: [{ bearerAuth: [] }],
      body: z.object({
        pageNum: z.number().default(1),
        pageSize: z.number().default(10),
        keyword: z.string().optional(),
      }),
    },
  }, async (request) => {
    const { pageNum, pageSize, keyword } = request.body
    const where = {
      isDeleted: 0,
      ...(keyword ? { name: { contains: keyword } } : {}),
    }
    const [list, total] = await Promise.all([
      fastify.prisma.category.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: 'asc' },
      }),
      fastify.prisma.category.count({ where }),
    ])
    return ok({ list, total })
  })

  app.post('/api/category/add', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['分类管理'],
      summary: '新增分类',
      security: [{ bearerAuth: [] }],
      body: z.object({
        name: z.string().min(1).max(64),
        description: z.string().max(255).optional(),
        sortOrder: z.number().default(0),
      }),
    },
  }, async (request) => {
    const data = await fastify.prisma.category.create({ data: request.body })
    return ok(data)
  })

  app.put('/api/category/update', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['分类管理'],
      summary: '修改分类',
      security: [{ bearerAuth: [] }],
      body: z.object({
        id: z.number(),
        name: z.string().min(1).max(64),
        description: z.string().max(255).optional(),
        sortOrder: z.number().default(0),
      }),
    },
  }, async (request) => {
    const { id, ...data } = request.body
    await fastify.prisma.category.update({ where: { id }, data })
    return ok(null)
  })

  app.delete('/api/category/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['分类管理'],
      summary: '删除分类',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
    },
  }, async (request) => {
    const id = Number(request.params.id)
    await fastify.prisma.category.update({
      where: { id },
      data: { isDeleted: 1 },
    })
    return ok(null)
  })
}
