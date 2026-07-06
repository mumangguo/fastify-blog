/**
 * 骨架屏组件。数据加载期间占位，避免"白屏 → 内容忽然出现"的跳变，
 * 也让页面高度稳定不发生 CLS。
 *
 * 设计约定：
 * - 用 Tailwind 的 animate-pulse 做统一呼吸感
 * - 颜色统一 bg-gray-100（浅灰），与项目其他 Card/Chip 中性配色协调
 * - 各页面自己组合基础块，不做太重的封装
 */

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`h-4 bg-gray-100 rounded animate-pulse ${className}`} />
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

/** 单张文章卡片的骨架（用于列表页/首页） */
export function SkeletonArticleCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-3">
      <SkeletonLine className="w-3/4 h-6" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-5/6" />
      <div className="flex items-center gap-3 pt-2">
        <SkeletonLine className="w-20 h-3" />
        <SkeletonLine className="w-14 h-3" />
        <SkeletonLine className="w-16 h-5 rounded-full" />
      </div>
    </div>
  )
}

/** 文章卡片列表骨架，重复 count 次 */
export function SkeletonArticleList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonArticleCard key={i} />
      ))}
    </div>
  )
}

/** 侧栏 chip 组（分类/标签） */
export function SkeletonChipGroup({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-6 bg-gray-100 rounded-full animate-pulse"
          style={{ width: 40 + ((i * 17) % 60) }}
        />
      ))}
    </div>
  )
}

/** 文章详情页骨架 */
export function SkeletonArticleDetail() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl shadow-sm bg-white p-6 md:p-8 space-y-4">
        <SkeletonLine className="w-4/5 h-8" />
        <div className="flex items-center gap-4">
          <SkeletonLine className="w-20 h-3" />
          <SkeletonLine className="w-14 h-3" />
          <SkeletonLine className="w-16 h-5 rounded-full" />
        </div>
        <SkeletonBlock className="w-full h-64" />
        <div className="space-y-2 pt-4">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-11/12" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-4/5" />
        </div>
      </div>
    </div>
  )
}
