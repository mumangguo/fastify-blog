import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import path from 'path'

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(import('@fastify/static'), {
    root: path.join(__dirname, '../../public/uploads'),
    prefix: '/uploads/',
  })
})
