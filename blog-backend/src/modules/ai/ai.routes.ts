import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages'
import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'

/**
 * 创建 LangChain ChatOpenAI 客户端。
 * 底层仍走 OpenAI 兼容的 /v1/chat/completions + SSE，与原生 SDK 传输一致；
 * 换成 LangChain 只是为了统一用其消息抽象与 .stream() 接口。
 * maxTokens 按调用点用 .bind() 覆盖。
 */
function createModel(maxTokens: number) {
  return new ChatOpenAI({
    apiKey: process.env.LLM_API_KEY || '1',
    model: process.env.LLM_MODEL || 'deepseek-v4-pro',
    temperature: 0.7,
    maxTokens,
    streaming: true,
    configuration: {
      baseURL: (process.env.LLM_BASE_URL || 'http://104.253.18.20:8080') + '/v1',
      timeout: 48000, // 48 秒，确保在 Vercel 60s 网关超时前返回可控错误
    },
  })
}

/** 从 LangChain 流式 chunk 中提取正文文本（content 可能是 string 或 分段数组） */
function extractText(content: any): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((part: any) => (typeof part === 'string' ? part : part?.text || ''))
      .join('')
  }
  return ''
}

/**
 * 写 SSE 响应头。除标准的 text/event-stream 外，额外加了防缓冲设置：
 * - X-Accel-Buffering: no —— 告诉 nginx/反向代理不要缓冲，逐帧转发
 * - Cache-Control: no-transform —— 禁止中间层对响应做转换/压缩
 * - Content-Encoding: identity —— 显式声明不压缩（identity 是标准 token，'none' 不合法）
 * - X-Content-Type-Options: nosniff —— 禁止内容嗅探
 * - 关闭 Nagle 算法(setNoDelay) —— 小数据帧立即发出，不等凑够一个 TCP 包
 * 并立即 flush 头，让前端第一时间进入流式读取状态。
 *
 * 注意：不手动设置 Transfer-Encoding。无 Content-Length 时 Node 会自动用 chunked；
 * 而 HTTP/2（Vercel 常用）下 Transfer-Encoding 是被禁止的头，手动设置会直接抛错。
 */
function sseHead(reply: any) {
  reply.raw.setHeader('Content-Type', 'text/event-stream')
  reply.raw.setHeader('Cache-Control', 'no-cache, no-transform')
  reply.raw.setHeader('Connection', 'keep-alive')
  reply.raw.setHeader('X-Accel-Buffering', 'no')
  reply.raw.setHeader('Content-Encoding', 'identity')
  reply.raw.setHeader('X-Content-Type-Options', 'nosniff')
  // 关闭 Nagle，避免小帧被 TCP 层攒着
  if (typeof reply.raw.socket?.setNoDelay === 'function') {
    reply.raw.socket.setNoDelay(true)
  }
  reply.raw.writeHead(200)
  // flushHeaders 只在此刷一次“响应头”；它不刷 body，body 由下面的 write 直接写 socket
  reply.raw.flushHeaders?.()
}

/**
 * SSE 辅助：发送一个事件。
 * Node 原生响应的 res.write() 对未缓冲流本就直接写入 socket，无需额外“刷 body”。
 * raw.flush?.() 仅在响应被压缩中间件（如 compression）包裹时存在，用可选链兜底。
 * （不要用 flushHeaders 逐帧“刷新”——它只处理响应头，对 body 毫无作用。）
 */
function sseWrite(reply: any, event: string, data: any) {
  reply.raw.write(`event: ${event}\n`)
  reply.raw.write(`data: ${JSON.stringify(data)}\n\n`)
  reply.raw.flush?.()
}

/**
 * 心跳：延迟 delay 毫秒后才开始，每 10 秒发一个 ping。
 * 延迟启动是为了：首 token 较快时（实测约 9s，<前端 20s 看门狗）完全不发多余 ping；
 * 只有迟迟没数据时才靠心跳保活。收到首个 token 应立即调用返回的 stop()。
 */
function startHeartbeat(reply: any, delay = 5000): () => void {
  let stopped = false
  let interval: ReturnType<typeof setInterval> | null = null
  const timeout = setTimeout(() => {
    if (stopped) return
    interval = setInterval(() => {
      sseWrite(reply, 'ping', { time: Date.now() })
    }, 10000)
  }, delay)
  return () => {
    stopped = true
    clearTimeout(timeout)
    if (interval) clearInterval(interval)
  }
}

/** 根据 action 获取合适的 max_tokens，控制生成时间 */
function getMaxTokens(action: string): number {
  switch (action) {
    case 'title':
    case 'summary':
      return 256 // 标题/摘要很短
    case 'polish':
    case 'shrink':
      return 512 // 润色/精简和原文长度相近
    case 'expand':
    case 'continue':
      return 768 // 扩写/续写需要更多内容，控制在 768 以适配 Vercel 60s 限制
    default:
      return 512
  }
}

export default fp(async (fastify: FastifyInstance) => {
  // ========== 文章写作助手 (SSE 流式) ==========
  fastify.post('/api/ai/writer', async (request: any, reply) => {
    const { action, content } = request.body || {}
    if (!action || !content) {
      reply.code(400)
      return { code: 400, msg: '缺少必要参数 action 和 content', data: null }
    }

    const systemPrompt = `你是一个专业的文章写作助手。请根据用户的指令对文章内容进行处理，并以纯文本形式返回结果。
要求：
1. 只返回处理后的文本内容，不要添加任何解释说明
2. 不要包裹在 Markdown 代码块中
3. 保持段落格式自然`

    let userPrompt = ''
    switch (action) {
      case 'polish':
        userPrompt = `请对以下文章内容进行润色优化，使其更加流畅、专业，同时保持原意不变：\n\n${content}`
        break
      case 'expand':
        userPrompt = `请扩展以下文章内容，添加更多细节和论述，使其更加丰富充实：\n\n${content}`
        break
      case 'shrink':
        userPrompt = `请精简以下文章内容，保留核心观点和重要信息，使其更加简洁有力：\n\n${content}`
        break
      case 'title':
        userPrompt = `根据以下文章内容，生成 5 个吸引人的标题（每行一个，不要编号）：\n\n${content}`
        break
      case 'summary':
        userPrompt = `请为以下文章生成一段简洁的摘要（100字以内）：\n\n${content}`
        break
      case 'continue':
        userPrompt = `请续写以下文章内容，保持风格一致，自然衔接：\n\n${content}`
        break
      default:
        reply.code(400)
        return { code: 400, msg: `不支持的操作: ${action}`, data: null }
    }

    sseHead(reply)

    // 立即发送一个 ping 事件，确认连接建立
    sseWrite(reply, 'ping', { time: Date.now() })

    // 客户端断开时取消上游 LLM 请求，避免白白消耗 token 与连接
    const abortController = new AbortController()
    const onClientClose = () => abortController.abort()
    request.raw.on('close', onClientClose)

    // 心跳延迟启动：首 token 较快时不发多余 ping
    let stopHeartbeat: (() => void) | null = startHeartbeat(reply)
    const stopHeartbeatOnce = () => {
      if (stopHeartbeat) {
        stopHeartbeat()
        stopHeartbeat = null
      }
    }

    try {
      const model = createModel(getMaxTokens(action))
      const stream = await model.stream(
        [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)],
        { signal: abortController.signal } // 取消信号透传给底层 fetch
      )

      for await (const chunk of stream) {
        // 注：该网关的思考过程走 reasoning_content，而 LangChain 的 .stream()
        // 不透传该非标准字段，故这里只处理正文 content（已确认放弃单独展示思考过程）。
        const text = extractText(chunk.content)
        if (text) {
          stopHeartbeatOnce()
          sseWrite(reply, 'delta', { text })
        }
      }
      stopHeartbeatOnce()
      sseWrite(reply, 'done', {})
    } catch (err: any) {
      stopHeartbeatOnce()
      // 客户端主动断开导致的取消不算错误，静默结束即可
      if (err?.name !== 'AbortError') {
        fastify.log.error('AI writer error:', err)
        sseWrite(reply, 'error', { message: err.message || 'AI 服务请求失败' })
      }
    } finally {
      request.raw.removeListener('close', onClientClose)
      reply.raw.end()
    }
    return reply.hijack()
  })

  // ========== 博客分身对话 (SSE 流式) ==========
  fastify.post('/api/ai/chat', async (request: any, reply) => {
    const { message, history } = request.body || {}
    if (!message) {
      reply.code(400)
      return { code: 400, msg: '缺少 message 参数', data: null }
    }

    // 获取博客信息作为系统上下文
    const [siteConfigRes, articlesRes] = await Promise.allSettled([
      fastify.prisma.siteConfig.findMany({ where: { isDeleted: 0 } }),
      fastify.prisma.article.findMany({
        where: { isDeleted: 0, status: 1 },
        select: { id: true, title: true, summary: true, content: true },
        take: 20,
        orderBy: { createdTime: 'desc' },
      }),
    ])

    const siteConfigs: Record<string, string> = {}
    if (siteConfigRes.status === 'fulfilled') {
      for (const c of siteConfigRes.value) {
        siteConfigs[c.configKey] = c.configValue || ''
      }
    }

    let articleContext = ''
    if (articlesRes.status === 'fulfilled') {
      articleContext = articlesRes.value
        .map((a: any) => `《${a.title}》：${a.summary || a.content?.slice(0, 200)}`)
        .join('\n')
    }

    const siteName = siteConfigs['siteTitle'] || '木芒果'
    const siteSubtitle = siteConfigs['siteSubtitle'] || ''
    const aboutContent = siteConfigs['aboutContent'] || ''

    const systemPrompt = `你是"${siteName}"的博客 AI 分身${siteSubtitle ? `，${siteSubtitle}` : ''}。你了解博主的文章、关于我页面和网站信息。你要以博主的口吻与访客交流，回答关于博客内容的问题，推荐相关文章。

博客信息：
- 网站标题：${siteName}
- 关于我：${aboutContent || '暂无介绍'}

已发布的文章列表：
${articleContext || '暂无文章'}

对话规则：
1. 以第一人称（博主）的口吻回答，语气友好自然
2. 如果问到博客相关内容，基于上面的信息回答
3. 如果问到与博客无关的问题，礼貌地引导回博客主题
4. 回答要简洁，不要超过 300 字
5. 提到或推荐某篇文章时，必须用中文书名号《》包裹文章标题的完整原文（与上面列表中的标题逐字一致，不要改写、缩写或翻译），前端会据此渲染成可点击的跳转链接`

    const messages: BaseMessage[] = [new SystemMessage(systemPrompt)]
    if (Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        if (msg.role === 'user') messages.push(new HumanMessage(msg.content))
        else if (msg.role === 'assistant') messages.push(new AIMessage(msg.content))
      }
    }
    messages.push(new HumanMessage(message))

    sseHead(reply)

    // 立即发送一个 ping 事件，确认连接建立
    sseWrite(reply, 'ping', { time: Date.now() })

    // 客户端断开时取消上游 LLM 请求
    const abortController = new AbortController()
    const onClientClose = () => abortController.abort()
    request.raw.on('close', onClientClose)

    // 心跳延迟启动：首 token 较快时不发多余 ping
    let stopHeartbeat: (() => void) | null = startHeartbeat(reply)
    const stopHeartbeatOnce = () => {
      if (stopHeartbeat) {
        stopHeartbeat()
        stopHeartbeat = null
      }
    }

    try {
      const model = createModel(512) // 对话回复简洁，控制在 512
      const stream = await model.stream(messages, {
        signal: abortController.signal,
      })

      for await (const chunk of stream) {
        // LangChain 的 .stream() 不透传网关的 reasoning_content，故只处理正文
        const text = extractText(chunk.content)
        if (text) {
          stopHeartbeatOnce()
          sseWrite(reply, 'delta', { text })
        }
      }
      stopHeartbeatOnce()
      sseWrite(reply, 'done', {})
    } catch (err: any) {
      stopHeartbeatOnce()
      // 客户端主动断开导致的取消不算错误，静默结束即可
      if (err?.name !== 'AbortError') {
        fastify.log.error('AI chat error:', err)
        sseWrite(reply, 'error', { message: err.message || 'AI 服务请求失败' })
      }
    } finally {
      request.raw.removeListener('close', onClientClose)
      reply.raw.end()
    }
    return reply.hijack()
  })
})
