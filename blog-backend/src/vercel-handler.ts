import build from './app'

let appPromise: Promise<any> | null = null

async function getApp() {
  if (!appPromise) {
    appPromise = build().then(async (app) => {
      // 必须等 Fastify 完成插件/路由注册后，底层 http.Server 才能接管请求
      await app.ready()
      return app
    })
  }
  return appPromise
}

/**
 * Vercel Serverless 入口。
 *
 * 之前使用 app.inject() 会把整个响应缓冲在内存中，等 handler 结束后一次性返回，
 * 导致 SSE 流式接口（/api/ai/*）无法真正边生成边推送——整段回答被憋到生成结束，
 * 前端看门狗超时报“AI 服务响应超时”。
 *
 * 改为把真实的 Node req/res 直接交给 Fastify 底层 http.Server 处理，
 * 这样 reply.raw.write 会实时写入真实 socket，实现端到端流式。
 */
export default async function handler(req: any, res: any) {
  const app = await getApp()
  app.server.emit('request', req, res)
}

// 关闭 Vercel 自带的 body 解析，把原始请求流交给 Fastify 自己解析，
// 否则请求体会被提前消费，emit 转发后 Fastify 读不到 body。
export const config = {
  api: {
    bodyParser: false,
  },
}
