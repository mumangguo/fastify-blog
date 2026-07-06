import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ok } from '../../schemas/result'

export default async function (fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get('/api/link/list', {
    schema: { tags: ['友情链接'], summary: '获取友情链接列表（公开）' },
  }, async () => {
    const list = await fastify.prisma.link.findMany({
      where: { isDeleted: 0 },
      orderBy: { sortOrder: 'asc' },
    })
    return ok(list)
  })

  app.post('/api/link/page', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['友情链接'],
      summary: '分页查询友情链接',
      security: [{ bearerAuth: [] }],
      body: z.object({
        pageNum: z.number().default(1),
        pageSize: z.number().default(10),
        keyword: z.string().optional(),
      }),
    },
  }, async (request) => {
    const { pageNum, pageSize, keyword } = request.body
    const where: any = {
      isDeleted: 0,
      ...(keyword ? { name: { contains: keyword } } : {}),
    }
    const [list, total] = await Promise.all([
      fastify.prisma.link.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: 'asc' },
      }),
      fastify.prisma.link.count({ where }),
    ])
    return ok({ list, total })
  })

  app.post('/api/link/add', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['友情链接'],
      summary: '新增友情链接',
      security: [{ bearerAuth: [] }],
      body: z.object({
        name: z.string().min(1).max(64),
        url: z.string().url().max(255),
        description: z.string().max(255).optional(),
        icon: z.string().max(255).optional(),
        sortOrder: z.number().default(0),
      }),
    },
  }, async (request) => {
    const data = await fastify.prisma.link.create({ data: request.body })
    return ok(data)
  })

  app.put('/api/link/update', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['友情链接'],
      summary: '修改友情链接',
      security: [{ bearerAuth: [] }],
      body: z.object({
        id: z.number(),
        name: z.string().min(1).max(64),
        url: z.string().url().max(255),
        description: z.string().max(255).optional(),
        icon: z.string().max(255).optional(),
        sortOrder: z.number().default(0),
      }),
    },
  }, async (request) => {
    const { id, ...data } = request.body
    await fastify.prisma.link.update({ where: { id }, data })
    return ok(null)
  })

  app.delete('/api/link/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['友情链接'],
      summary: '删除友情链接',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
    },
  }, async (request) => {
    const id = Number(request.params.id)
    await fastify.prisma.link.update({ where: { id }, data: { isDeleted: 1 } })
    return ok(null)
  })
}
