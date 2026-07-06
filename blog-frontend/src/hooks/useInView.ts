import { useEffect, useRef, useState } from 'react'

/**
 * Intersection Observer 入场动画 hook。
 * 元素进入视口后一次性触发 visible=true，用于配合 fade-up 等 CSS 过渡。
 * 只触发一次，滚动出视口不重置，避免打扰阅读。
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // 已经在视口内（首屏）直接 visible，避免闪一下
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.9) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, visible]
}
