import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, ScrollShadow } from '@heroui/react'
import { Icon } from '@iconify/react'
import { Search, FileText, Tag, ArrowRight, X } from 'lucide-react'
import { initSearchIndex, searchArticles, ArticleDoc } from '@/services/searchIndex'

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<ArticleDoc[]>([])
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)

  // 初始化索引
  useEffect(() => {
    if (open) {
      setLoading(true)
      initSearchIndex().then(() => {
        setReady(true)
        setLoading(false)
        setTimeout(() => inputRef.current?.focus(), 100)
      })
    }
  }, [open])

  // 键盘快捷键 Ctrl/Cmd + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // ESC 关闭
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleSearch = useCallback((value: string) => {
    setKeyword(value)
    if (!value.trim() || !ready) {
      setResults([])
      return
    }
    setResults(searchArticles(value, 20))
  }, [ready])

  const handleSelect = (article: ArticleDoc) => {
    onClose()
    setKeyword('')
    navigate(`/article/${article.id}`)
  }

  const handleEnter = () => {
    if (results.length > 0) {
      handleSelect(results[0])
    } else if (keyword.trim()) {
      onClose()
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]" onClick={onClose}>
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* 搜索面板 */}
      <div
        className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 输入框 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-[#87CEEB] shrink-0" />
          <Input
            ref={inputRef}
            value={keyword}
            onValueChange={handleSearch}
            onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
            placeholder="搜索文章标题、内容、标签..."
            variant="underlined"
            classNames={{
              input: 'text-lg',
              inputWrapper: 'border-0 shadow-none after:rounded-none',
            }}
          />
          <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-400">
            ESC
          </kbd>
        </div>

        {/* 结果区域 */}
        <ScrollShadow className="max-h-[50vh]" size={20}>
          {loading && (
            <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
              正在加载索引...
            </div>
          )}

          {!loading && !keyword && ready && (
            <div className="py-10 text-center text-gray-400 text-sm space-y-2">
              <Icon icon="solar:magnifer-bold" className="text-4xl text-gray-300 mx-auto" />
              <p>输入关键词开始搜索</p>
              <p className="text-xs">支持文章标题、内容、标签的模糊搜索</p>
            </div>
          )}

          {!loading && keyword && results.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm space-y-2">
              <Icon icon="solar:document-medicine-bold" className="text-4xl text-gray-300 mx-auto" />
              <p>未找到匹配结果</p>
              <button
                className="text-[#87CEEB] hover:underline text-xs"
                onClick={() => {
                  onClose()
                  navigate(`/search?q=${encodeURIComponent(keyword)}`)
                }}
              >
                前往搜索页查看更多 &rarr;
              </button>
            </div>
          )}

          {/* 匹配的文章 */}
          {!loading && results.length > 0 && (
            <div className="py-2">
              <div className="px-5 flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <FileText className="w-3 h-3" /> {results.length} 篇文章
              </div>
              {results.slice(0, 10).map((article) => (
                <button
                  key={article.id}
                  onClick={() => handleSelect(article)}
                  className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 group-hover:text-[#87CEEB] transition-colors truncate">
                      {article.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {article.summary || article.content.slice(0, 80)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {article.category && (
                        <span className="text-xs text-[#87CEEB]">{article.category}</span>
                      )}
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-gray-300">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#87CEEB] shrink-0 mt-1 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* 底部提示 */}
          {!loading && results.length > 3 && (
            <div className="border-t border-gray-100 px-5 py-2.5 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                按 <kbd className="px-1 py-0.5 rounded border border-gray-200 mx-0.5">Enter</kbd> 查看第一个结果
              </span>
              <button
                className="text-xs text-[#87CEEB] hover:underline"
                onClick={() => {
                  onClose()
                  navigate(`/search?q=${encodeURIComponent(keyword)}`)
                }}
              >
                查看全部结果 &rarr;
              </button>
            </div>
          )}
        </ScrollShadow>
      </div>
    </div>
  )
}
