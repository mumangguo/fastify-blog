import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ok, fail } from '../../schemas/result'
import { hashPassword, comparePassword } from '../../utils/bcrypt'

/** 生成 10-18 位随机字母+数字密码 */
function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const length = 10 + Math.floor(Math.random() * 9) // 10~18
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  return password
}

export default async function (fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // 检查系统是否已初始化（是否存在管理员用户）
  app.get('/api/user/init-status', {
    schema: {
      tags: ['用户管理'],
      summary: '检查是否已初始化管理员',
    },
  }, async () => {
    const adminCount = await fastify.prisma.user.count({
      where: { isDeleted: 0 },
    })
    return ok({ initialized: adminCount > 0 })
  })

  // 系统初始化：创建管理员并返回密码（仅未初始化时可用）
  app.post('/api/user/init', {
    schema: {
      tags: ['用户管理'],
      summary: '初始化管理员账户',
      body: z.object({
        username: z.string().min(3).max(64).optional().default('admin'),
      }),
    },
  }, async (request) => {
    const adminCount = await fastify.prisma.user.count({
      where: { isDeleted: 0 },
    })
    if (adminCount > 0) {
      return fail('系统已初始化，无法重复创建管理员')
    }

    const username = request.body.username || 'admin'
    const plainPassword = generatePassword()
    const hashed = await hashPassword(plainPassword)

    const user = await fastify.prisma.user.create({
      data: { username, password: hashed, role: 'admin' },
    })

    return ok({
      id: user.id,
      username: user.username,
      password: plainPassword,
      message: `管理员账户已创建，请妥善保存密码！密码仅在此次展示。`,
    })
  })

  app.post('/api/user/login', {
    schema: {
      tags: ['用户管理'],
      summary: '管理员登录',
      body: z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
    },
  }, async (request) => {
    const { username, password } = request.body
    const user = await fastify.prisma.user.findFirst({
      where: { username, isDeleted: 0 },
    })
    if (!user) {
      return fail('用户不存在')
    }
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      return fail('密码错误')
    }
    const token = fastify.jwt.sign({ id: user.id, role: user.role })
    return ok({ token, username: user.username, role: user.role })
  })

  app.post('/api/user/register', {
    schema: {
      tags: ['用户管理'],
      summary: '注册管理员（初始化用）',
      body: z.object({
        username: z.string().min(3).max(64),
        password: z.string().min(6).max(64),
      }),
    },
  }, async (request) => {
    const { username, password } = request.body
    const exist = await fastify.prisma.user.findFirst({
      where: { username, isDeleted: 0 },
    })
    if (exist) {
      return fail('用户名已存在')
    }
    const hashed = await hashPassword(password)
    const user = await fastify.prisma.user.create({
      data: { username, password: hashed },
    })
    return ok({ id: user.id })
  })

  app.get('/api/user/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['用户管理'],
      summary: '获取当前用户信息',
      security: [{ bearerAuth: [] }],
    },
  }, async (request) => {
    const { id } = request.user as { id: number }
    const user = await fastify.prisma.user.findFirst({
      where: { id, isDeleted: 0 },
      select: { id: true, username: true, role: true, createdTime: true },
    })
    return ok(user)
  })
}
