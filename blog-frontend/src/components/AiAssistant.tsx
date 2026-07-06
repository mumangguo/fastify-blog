import { useState, useRef } from 'react'
import { Button, addToast } from '@heroui/react'
import { Sparkles, Copy, Check, RotateCcw } from 'lucide-react'
import { ssePost } from '@/api/ai'
import { useTypewriter } from '@/hooks/useTypewriter'

interface AiAssistantProps {
  content: string
  onApply: (result: string, action: string) => void
}

const actions = [
  { key: 'polish', label: '润色优化', desc: '优化语言表达' },
  { key: 'expand', label: '扩写丰富', desc: '增加更多细节' },
  { key: 'shrink', label: '精简压缩', desc: '保留核心观点' },
  { key: 'title', label: '生成标题', desc: '根据内容生成' },
  { key: 'summary', label: '生成摘要', desc: '自动提取摘要' },
  { key: 'continue', label: '续写', desc: '继续写下去' },
]

export default function AiAssistant({ content, onApply }: AiAssistantProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)

  const handleAction = (actionKey: string) => {
    if (!content.trim()) {
      addToast({ title: '提示', description: '请先在编辑器中输入一些内容', color: 'warning', timeout: 2000 })
      return
    }
    if (abortRef.current) {
      abortRef.current()
      abortRef.current = null
    }

    setLoading(true)
    setStreaming(true)
    setThinking(false)
    setActiveAction(actionKey)
    setResult('')
    setCopied(false)

    let fullText = ''

    abortRef.current = ssePost(
      '/ai/writer',
      { action: actionKey, content },
      (delta) => {
        fullText += delta
        setResult(fullText)
        // 正文开始输出，思考阶段结束
        setThinking(false)
      },
      () => {
        setLoading(false)
        setStreaming(false)
        setThinking(false)
        abortRef.current = null
      },
      (err) => {
        setLoading(false)
        setStreaming(false)
        setThinking(false)
        abortRef.current = null
        addToast({ title: '请求失败', description: err, color: 'danger', timeout: 3000 })
      },
      // onReasoning：推理阶段只显示“思考中”，不把推理文本混入 result
      () => {
        setThinking(true)
      }
    )
  }

  const handleApply = () => {
    if (!result) return
    onApply(result, activeAction || '')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#87CEEB]" />
        <span className="text-sm font-medium">AI 写作助手</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((act) => (
          <Button
            key={act.key}
            size="sm"
            variant={activeAction === act.key ? 'solid' : 'flat'}
            color={activeAction === act.key ? 'primary' : 'default'}
            isDisabled={loading && activeAction !== act.key}
            onPress={() => handleAction(act.key)}
          >
            {loading && activeAction === act.key ? (
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3 animate-spin" />
                生成中...
              </span>
            ) : (
              act.label
            )}
          </Button>
        ))}
      </div>

      {(result || streaming) && (
        <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2">
          {thinking && !result && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <RotateCcw className="w-3 h-3 animate-spin" />
              <span>思考中…</span>
            </div>
          )}
          <TypewriterText text={result} streaming={streaming} />
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="solid"
              isDisabled={streaming || !result}
              onPress={handleApply}
            >
              应用到编辑器
            </Button>
            <Button size="sm" variant="flat" isIconOnly onPress={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function TypewriterText({ text, streaming }: { text: string; streaming: boolean }) {
  // 用打字机 hook 逐字揭示，解耦网络到达与显示速度
  const shown = useTypewriter(text, { charsPerSecond: 200, done: !streaming })
  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-gray-800 min-h-[60px]">
      {shown}
      {streaming && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-[#87CEEB] animate-pulse rounded-sm align-middle" />
      )}
    </div>
  )
}
