import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ok } from '../../schemas/result'

export default async function (fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get('/api/site-config', {
    schema: { tags: ['系统配置'], summary: '获取所有配置（公开）' },
  }, async () => {
    const list = await fastify.prisma.siteConfig.findMany({
      where: { isDeleted: 0 },
    })
    const config: Record<string, string> = {}
    list.forEach((item) => {
      if (item.configValue) config[item.configKey] = item.configValue
    })
    return ok(config)
  })

  app.get('/api/site-config/about', {
    schema: { tags: ['系统配置'], summary: '获取关于我内容（公开）' },
  }, async () => {
    const item = await fastify.prisma.siteConfig.findFirst({
      where: { configKey: 'about', isDeleted: 0 },
    })
    return ok({ content: item?.configValue || '' })
  })

  app.post('/api/site-config', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['系统配置'],
      summary: '批量保存配置',
      security: [{ bearerAuth: [] }],
      body: z.record(z.string().optional()),
    },
  }, async (request) => {
    const data = request.body
    for (const [key, value] of Object.entries(data)) {
      await fastify.prisma.siteConfig.upsert({
        where: { configKey: key },
        update: { configValue: value || '' },
        create: { configKey: key, configValue: value || '' },
      })
    }
    return ok(null)
  })

  app.post('/api/site-config/about', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['系统配置'],
      summary: '保存关于我内容',
      security: [{ bearerAuth: [] }],
      body: z.object({ content: z.string() }),
    },
  }, async (request) => {
    const { content } = request.body
    await fastify.prisma.siteConfig.upsert({
      where: { configKey: 'about' },
      update: { configValue: content },
      create: { configKey: 'about', configValue: content },
    })
    return ok(null)
  })
}
