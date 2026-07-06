import { useState, useRef, useEffect } from 'react'
import { Button, Input } from '@heroui/react'
import { Icon } from '@iconify/react'
import { Send, X, MessageCircle } from 'lucide-react'
import { ssePost } from '@/api/ai'
import { getArticleList } from '@/api/article'
import ArticleLinkText from './ArticleLinkText'
import { useTypewriter } from '@/hooks/useTypewriter'

interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export default function BlogChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  // 已发布文章的 id + 标题，用于把 AI 回答中的《标题》渲染成跳转链接
  const [articles, setArticles] = useState<Array<{ id: number; title: string }>>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 首次打开对话时拉取文章列表（用于超链接匹配），只加载一次
  useEffect(() => {
    if (!open || articles.length > 0) return
    getArticleList({ pageNum: 1, pageSize: 100 })
      .then((res: any) => {
        const list = res.data?.list || []
        setArticles(list.map((a: any) => ({ id: a.id, title: a.title })))
      })
      .catch(() => {
        // 拉取失败不影响对话，只是标题不渲染成链接
      })
  }, [open, articles.length])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // 添加一个正在流式输出的空消息占位
    setMessages((prev) => [...prev, { role: 'assistant', content: '', streaming: true }])

    let fullText = ''

    const history = messages
      .filter((m) => !m.streaming)
      .map((m) => ({ role: m.role, content: m.content }))

    abortRef.current = ssePost(
      '/ai/chat',
      { message: text, history },
      (delta) => {
        fullText += delta
        // 不可变更新：替换成新的消息对象，否则 React 引用比较认为未变、不重渲染，
        // 打字机效果会被吃掉，直到流结束才一次性显示。
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant' || !last.streaming) return prev
          return [...prev.slice(0, -1), { ...last, content: fullText }]
        })
      },
      () => {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant') return prev
          return [...prev.slice(0, -1), { ...last, streaming: false }]
        })
        abortRef.current = null
      },
      (err) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant') return prev
          return [...prev.slice(0, -1), { ...last, content: `抱歉，出了点问题：${err}`, streaming: false }]
        })
        abortRef.current = null
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#87CEEB] hover:bg-[#5DB8E0] text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
        title="和博主聊一聊"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* 头部 */}
      <div className="bg-[#87CEEB] text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Icon icon="solar:pen-new-square-bold" className="text-lg" />
          </div>
          <div>
            <div className="text-sm font-bold">博客分身</div>
            <div className="text-xs text-white/80">有任何问题都可以问我</div>
          </div>
        </div>
        <Button isIconOnly size="sm" variant="light" className="text-white hover:bg-white/20" onPress={() => setOpen(false)}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* 消息区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#E0F4FC] rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-8 h-8 text-[#87CEEB]" />
            </div>
            <p className="text-gray-500 text-sm">你好！我是博客的 AI 分身</p>
            <p className="text-gray-400 text-xs mt-1">可以问我关于博客的任何问题</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessageItem key={i} msg={msg} articles={articles} />
        ))}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-100 px-4 py-3 shrink-0">
        <div className="flex gap-2">
          <Input
            size="sm"
            placeholder="输入消息..."
            value={input}
            onValueChange={setInput}
            onKeyDown={handleKeyDown}
            classNames={{ inputWrapper: 'rounded-full' }}
          />
          <Button
            isIconOnly
            size="sm"
            color="primary"
            isDisabled={!input.trim()}
            onPress={handleSend}
            className="rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * 单条消息渲染。助手消息用打字机 hook 逐字揭示，把网络到达速度与显示速度解耦，
 * 即便上游网关一次吐一大块，界面也呈现平滑的打字机效果。
 */
function ChatMessageItem({
  msg,
  articles,
}: {
  msg: Message
  articles: Array<{ id: number; title: string }>
}) {
  const shownContent = useTypewriter(msg.content || '', {
    charsPerSecond: 200,
    done: !msg.streaming,
  })

  if (msg.role === 'user') {
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed bg-[#87CEEB] text-white rounded-br-md">
          {msg.content}
        </div>
      </div>
    )
  }

  // 正文是否已开始显示（首 token 前显示等待指示）
  const contentStarted = shownContent.length > 0

  return (
    <div className="flex flex-col items-start">
      <div className="max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed bg-gray-100 text-gray-800 rounded-bl-md">
        {msg.streaming && !contentStarted ? (
          <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs">
            <span className="inline-block w-2 h-4 bg-[#87CEEB] animate-pulse rounded-sm" />
            思考中…
          </span>
        ) : (
          <span className="whitespace-pre-wrap">
            <ArticleLinkText text={shownContent} articles={articles} />
          </span>
        )}
        {msg.streaming && contentStarted && (
          <span className="inline-block w-2 h-4 ml-0.5 bg-[#87CEEB] animate-pulse rounded-sm align-middle" />
        )}
      </div>
    </div>
  )
}
