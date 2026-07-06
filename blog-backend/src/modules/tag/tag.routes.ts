import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ok, fail } from '../../schemas/result'

export default async function (fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get('/api/tag/list', {
    schema: { tags: ['标签管理'], summary: '获取标签列表（公开）' },
  }, async () => {
    const list = await fastify.prisma.tag.findMany({
      where: { isDeleted: 0 },
      orderBy: { createdTime: 'desc' },
    })
    return ok(list)
  })

  app.post('/api/tag/page', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['标签管理'],
      summary: '分页查询标签',
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
      fastify.prisma.tag.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdTime: 'desc' },
      }),
      fastify.prisma.tag.count({ where }),
    ])
    return ok({ list, total })
  })

  app.post('/api/tag/add', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['标签管理'],
      summary: '新增标签',
      security: [{ bearerAuth: [] }],
      body: z.object({
        name: z.string().min(1).max(64),
      }),
    },
  }, async (request) => {
    const exist = await fastify.prisma.tag.findFirst({
      where: { name: request.body.name, isDeleted: 0 },
    })
    if (exist) return fail('标签名称已存在')
    const data = await fastify.prisma.tag.create({ data: request.body })
    return ok(data)
  })

  app.put('/api/tag/update', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['标签管理'],
      summary: '修改标签',
      security: [{ bearerAuth: [] }],
      body: z.object({
        id: z.number(),
        name: z.string().min(1).max(64),
      }),
    },
  }, async (request) => {
    const { id, ...data } = request.body
    await fastify.prisma.tag.update({ where: { id }, data })
    return ok(null)
  })

  app.delete('/api/tag/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['标签管理'],
      summary: '删除标签',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
    },
  }, async (request) => {
    const id = Number(request.params.id)
    await fastify.prisma.tag.update({ where: { id }, data: { isDeleted: 1 } })
    return ok(null)
  })
}
