import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react'

/**
 * 全局"选中文字问博客分身"浮出菜单。
 *
 * 桌面端：紧贴选区右上方浮出小按钮。
 * 移动端：底部固定浮条（避免被 iOS/Android 系统复制菜单遮挡，也避免
 *          选区句柄拖动时位置抖动）。
 *
 * 触发兼容：mouseup / keyup / touchend / selectionchange 四路监听。
 */
export default function SelectionAskMenu() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  // 用 matchMedia 判断移动端（也作为初始值，避免首屏闪烁）
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const inEditable = useCallback((node: Node | null) => {
    let el: Node | null = node
    while (el) {
      if (el instanceof HTMLElement) {
        const tag = el.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return true
        if (el.isContentEditable) return true
        if (el.dataset?.selectionAskMenu) return true
      }
      el = el.parentNode
    }
    return false
  }, [])

  const update = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setPos(null)
      return
    }
    const text = sel.toString().trim()
    if (text.length < 4) {
      setPos(null)
      return
    }
    const range = sel.getRangeAt(0)
    if (inEditable(range.startContainer) || inEditable(range.endContainer)) {
      setPos(null)
      return
    }
    const rect = range.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      setPos(null)
      return
    }
    setSelectedText(text.slice(0, 1200))

    if (isMobile) {
      // 移动端：底部居中固定，不跟选区位置走
      setPos({ x: 0, y: 0 })
    } else {
      // 桌面端：紧贴选区右上方
      const btnW = 148
      const btnH = 36
      let x = rect.right - btnW
      let y = rect.top - btnH - 8
      if (y < 8) y = rect.bottom + 8
      if (x < 8) x = 8
      if (x + btnW > window.innerWidth - 8) x = window.innerWidth - btnW - 8
      setPos({ x, y })
    }
  }, [isMobile, inEditable])

  useEffect(() => {
    const scheduleUpdate = () => requestAnimationFrame(update)
    const onScroll = () => setPos(null)
    const onSelectionChange = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) setPos(null)
    }

    // 桌面端：鼠标/键盘触发
    document.addEventListener('mouseup', scheduleUpdate)
    document.addEventListener('keyup', scheduleUpdate)
    // 移动端：触摸结束触发（比 click 早，比 touchend 稳）
    document.addEventListener('touchend', scheduleUpdate, { passive: true })
    // 兜底：选区变化时尝试更新（某些浏览器 touchend 后选区才稳定）
    document.addEventListener('selectionchange', onSelectionChange)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      document.removeEventListener('mouseup', scheduleUpdate)
      document.removeEventListener('keyup', scheduleUpdate)
      document.removeEventListener('touchend', scheduleUpdate)
      document.removeEventListener('selectionchange', onSelectionChange)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [update])

  if (!pos) return null

  const handleAsk = () => {
    const question = `我读到一段内容：\n"${selectedText}"\n\n请解释一下，或告诉我博客里还有哪些相关文章？`
    window.dispatchEvent(new CustomEvent('blog-chat:ask', { detail: { text: question } }))
    setPos(null)
    window.getSelection()?.removeAllRanges()
  }

  // 移动端：底部固定浮条
  if (isMobile) {
    return (
      <div
        data-selection-ask-menu="true"
        className="fixed bottom-20 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none"
      >
        <button
          onTouchStart={(e) => e.preventDefault()} // 防止触摸时先取消选区
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAsk}
          className="pointer-events-auto flex items-center gap-2 px-5 h-12 rounded-full bg-[#87CEEB] active:bg-[#5DB8E0] text-white text-base font-medium shadow-xl shadow-[#87CEEB]/40 max-w-[90vw]"
        >
          <Icon icon="solar:magic-stick-3-bold" className="w-5 h-5 shrink-0" />
          <span className="truncate">问博客分身</span>
        </button>
      </div>
    )
  }

  // 桌面端：紧贴选区
  return (
    <button
      data-selection-ask-menu="true"
      onMouseDown={(e) => e.preventDefault()}
      onClick={handleAsk}
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-[60] flex items-center gap-1.5 px-3 h-9 rounded-full bg-[#87CEEB] hover:bg-[#5DB8E0] text-white text-sm font-medium shadow-lg shadow-[#87CEEB]/40 transition-transform hover:scale-105"
    >
      <Icon icon="solar:magic-stick-3-bold" className="w-4 h-4" />
      问博客分身
    </button>
  )
}
