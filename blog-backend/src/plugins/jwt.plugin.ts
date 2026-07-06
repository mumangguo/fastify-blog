import fp from 'fastify-plugin'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'blog-system-secret-key-2024-very-long-and-secure',
    sign: { expiresIn: '7d' },
  })

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send({ code: 401, msg: 'token 无效或已过期', data: null })
    }
  })
})
