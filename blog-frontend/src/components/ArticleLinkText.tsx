import { Fragment } from 'react'
import { Link } from 'react-router-dom'

/**
 * 把文本中形如《文章标题》的片段，匹配已发布文章后渲染成可点击超链接。
 * 采用“事后匹配已知标题”而非依赖模型输出 markdown：
 * 流式过程中半截 markdown 会渲染错乱，而按《》匹配标题无论模型怎么输出都稳定。
 *
 * @param text     待渲染文本
 * @param articles 已发布文章的 id + 标题列表
 */
export default function ArticleLinkText({
  text,
  articles,
}: {
  text: string
  articles: Array<{ id: number; title: string }>
}) {
  if (!text) return null

  // 标题归一化：去首尾空格、折叠内部空白，提升匹配容错
  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ')
  const titleMap = new Map<string, number>()
  for (const a of articles) {
    if (a.title) titleMap.set(normalize(a.title), a.id)
  }

  // 按《...》切分，保留分隔片段
  const parts = text.split(/(《[^》]*》)/g)

  return (
    <>
      {parts.map((part, i) => {
        const m = /^《([^》]*)》$/.exec(part)
        if (m) {
          const id = titleMap.get(normalize(m[1]))
          if (id !== undefined) {
            return (
              <Link
                key={i}
                to={`/article/${id}`}
                className="text-[#2b9fd4] underline underline-offset-2 hover:text-[#1b7fb0] break-all"
              >
                {part}
              </Link>
            )
          }
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
