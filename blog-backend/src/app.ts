import Fastify from 'fastify'
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import corsPlugin from './plugins/cors.plugin'
import jwtPlugin from './plugins/jwt.plugin'
import prismaPlugin from './plugins/prisma.plugin'
import dateFormatPlugin from './plugins/date-format.plugin'
import swaggerPlugin from './plugins/swagger.plugin'
import staticPlugin from './plugins/static.plugin'

const fastify = Fastify({
  logger: process.env.NODE_ENV === 'development'
    ? { transport: { target: 'pino-pretty' } }
    : true,
  // AI SSE 流式接口需要较长请求超时，设为 120 秒
  requestTimeout: 120000,
  // SSE 接口需要更长 body 解析时间
  bodyLimit: 10 * 1024 * 1024, // 10MB
}).withTypeProvider<ZodTypeProvider>()

fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

async function build() {
  await fastify.register(corsPlugin)
  await fastify.register(jwtPlugin)
  await fastify.register(prismaPlugin)
  await fastify.register(dateFormatPlugin)
  await fastify.register(staticPlugin)
  await fastify.register(swaggerPlugin)

  // 注册业务模块路由
  await fastify.register(import('./modules/user/user.routes'))
  await fastify.register(import('./modules/article/article.routes'))
  await fastify.register(import('./modules/category/category.routes'))
  await fastify.register(import('./modules/tag/tag.routes'))
  await fastify.register(import('./modules/comment/comment.routes'))
  await fastify.register(import('./modules/link/link.routes'))
  await fastify.register(import('./modules/site-config/site-config.routes'))
  await fastify.register(import('./modules/upload/upload.routes'))
  await fastify.register(import('./modules/dashboard/dashboard.routes'))
  await fastify.register(import('./modules/ai/ai.routes'))

  return fastify
}

export default build
