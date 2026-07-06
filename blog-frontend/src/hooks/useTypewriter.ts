import { useEffect, useRef, useState } from 'react'

/**
 * 打字机效果 hook。
 *
 * 把“网络到达速度”和“屏幕显示速度”解耦：上游网关往往一次吐一大块（几十字），
 * 甚至整段 1 秒内发完，直接渲染就是“唰”地出现。此 hook 缓存完整目标文本，
 * 再用 requestAnimationFrame 按固定字符速率逐字揭示，得到平滑打字机效果。
 *
 * 追平目标后自动停止动画；目标继续增长时再重启，避免无谓空转。
 *
 * @param target 目标文本，可随流式增长
 * @param opts.charsPerSecond 每秒揭示字符数，默认 220
 * @returns 当前应显示的文本片段
 */
export function useTypewriter(
  target: string,
  opts?: { charsPerSecond?: number; done?: boolean }
): string {
  const charsPerSecond = opts?.charsPerSecond ?? 220
  const [shown, setShown] = useState('')
  const shownLenRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  useEffect(() => {
    // 目标变短（新会话/重置）：直接对齐，不做动画
    if (target.length < shownLenRef.current) {
      shownLenRef.current = target.length
      setShown(target.slice(0, target.length))
      return
    }
    // 已追平：无需动画
    if (shownLenRef.current >= target.length) return

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const elapsed = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts

      const remaining = target.length - shownLenRef.current
      // 本帧揭示字符数：至少 1；积压过多时加速追赶
      let step = Math.max(1, Math.round(charsPerSecond * elapsed))
      if (remaining > 120) step = Math.max(step, Math.ceil(remaining / 12))

      const nextLen = Math.min(target.length, shownLenRef.current + step)
      shownLenRef.current = nextLen
      setShown(target.slice(0, nextLen))

      if (nextLen < target.length) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
        lastTsRef.current = null
      }
    }

    lastTsRef.current = null
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
    }
  }, [target, charsPerSecond])

  return shown
}
