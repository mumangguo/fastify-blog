/**
 * SSE POST 请求工具
 * @param url 请求路径（不含 /api 前缀）
 * @param body 请求体
 * @param onDelta 每次收到正式回答增量内容的回调
 * @param onDone 流结束的回调
 * @param onError 出错的回调
 * @param onReasoning 推理模型思考过程（reasoning_content）增量回调，可选
 * @returns 返回一个 abort 函数
 */
export function ssePost(
  url: string,
  body: any,
  onDelta: (text: string) => void,
  onDone?: () => void,
  onError?: (err: string) => void,
  onReasoning?: (text: string) => void
): () => void {
  const controller = new AbortController()
  let aborted = false
  let done = false
  let activityTimer: ReturnType<typeof setTimeout> | null = null

  const clearTimers = () => {
    if (activityTimer) {
      clearTimeout(activityTimer)
      activityTimer = null
    }
  }

  const cleanup = () => {
    if (aborted) return
    aborted = true
    clearTimers()
    controller.abort()
  }

  // 只触发一次完成回调，避免流结束时 done 事件与 reader 读完重复调用
  const finishOnce = () => {
    if (done) return
    done = true
    clearTimers()
    onDone?.()
  }

  const friendlyError = (raw: string): string => {
    const r = raw.toLowerCase()
    if (r.includes('504') || r.includes('gateway timeout')) {
      return 'AI 服务响应超时，请稍后重试'
    }
    if (r.includes('aborted')) {
      return '请求已取消'
    }
    if (r.includes('502') || r.includes('bad gateway')) {
      return 'AI 服务网关异常，请稍后重试'
    }
    if (r.includes('500') || r.includes('internal server')) {
      return 'AI 服务内部错误，请稍后重试'
    }
    if (r.includes('503') || r.includes('service unavailab')) {
      return 'AI 服务暂时不可用，请稍后重试'
    }
    if (r.includes('fetch') || r.includes('network') || r.includes('failed to fetch') || r.includes('err_')) {
      return 'AI 服务连接失败，请检查后端服务是否已启动'
    }
    if (r.includes('timeout')) {
      return 'AI 服务响应超时，请稍后重试'
    }
    return raw
  }

  // 20 秒内未收到任何数据，认为连接卡死
  const resetActivityTimer = () => {
    if (activityTimer) clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
      if (!aborted) {
        cleanup()
        onError?.(friendlyError('timeout'))
      }
    }, 20000)
  }

  // 不再设置总时长上限：流式响应可能持续较久，只要仍有数据流入就应保持连接。
  // 连接卡死由上面的“20 秒无数据”看门狗负责兜底。

  fetch(`/api${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  }).then(async (res) => {
    resetActivityTimer()

    if (!res.ok) {
      const text = await res.text()
      cleanup()
      onError?.(friendlyError(`HTTP ${res.status}: ${text}`))
      return
    }

    const reader = res.body?.getReader()
    if (!reader) {
      cleanup()
      onError?.('无法读取响应流')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done: readerDone, value } = await reader.read()
      if (readerDone) break

      resetActivityTimer()

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      let currentEvent = ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim()
        } else if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim()
          if (dataStr === '[DONE]') continue
          try {
            const data = JSON.parse(dataStr)
            if (currentEvent === 'delta' && data.text) {
              onDelta(data.text)
            } else if (currentEvent === 'reasoning' && data.text) {
              onReasoning?.(data.text)
            } else if (currentEvent === 'done') {
              finishOnce()
            } else if (currentEvent === 'error') {
              cleanup()
              onError?.(friendlyError(data.message || '未知错误'))
              return
            }
            // ping 事件仅用于保活，无需处理
          } catch {
            // 忽略解析失败的行
          }
        }
      }
    }

    // 流自然结束：确保完成回调只触发一次
    clearTimers()
    finishOnce()
  }).catch((err) => {
    if (!aborted && err.name !== 'AbortError') {
      console.warn('[SSE fetch error]', err)
      cleanup()
      onError?.(friendlyError(err.message || '请求失败'))
    }
  })

  return cleanup
}
