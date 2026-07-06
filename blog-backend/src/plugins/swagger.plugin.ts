import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(import('@fastify/swagger'), {
    openapi: {
      info: { title: '个人博客系统 API 文档', version: '1.0.0', description: 'Fastify + Prisma 个人博客后端接口' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
    // 将 Zod schema 转换为 JSON Schema，否则 /docs/json 生成时会崩溃
    transform: jsonSchemaTransform,
  })

  await fastify.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: false },
  })
})
