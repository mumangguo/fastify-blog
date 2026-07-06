import FlexSearch from 'flexsearch'

export interface ArticleDoc {
  id: number
  title: string
  summary: string
  content: string
  categoryId: number
  category?: string
  tags: string[]
}

let documentIndex: any = null
let articleDocs: ArticleDoc[] = []
let initialized = false

/** 初始化索引并加载所有文章 */
export async function initSearchIndex() {
  if (initialized) return
  initialized = true

  documentIndex = new FlexSearch.Document({
    id: 'id',
    index: ['title', 'summary', 'content', 'tags'],
    tokenize: 'forward',
    resolution: 9,
    cache: 100,
  })

  try {
    const res = await fetch('/api/article/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNum: 1, pageSize: 9999 }),
    })
    const json = await res.json()
    const list: any[] = json?.data?.list || []

    articleDocs = list.map((a: any) => {
      const tags = a.tags?.map((t: any) => t.tag?.name || t.name) || []
      const doc: ArticleDoc = {
        id: a.id,
        title: a.title,
        summary: a.summary || '',
        content: a.content?.replace(/<[^>]+>/g, '') || '',
        categoryId: a.categoryId,
        category: a.category?.name,
        tags,
      }

      // Document.add 要求 id 字段在最外层
      documentIndex.add({
        id: doc.id,
        title: doc.title,
        summary: doc.summary,
        content: doc.content,
        tags: tags.join(' '),  // 将数组拼接为字符串索引
      })

      return doc
    })
  } catch (err) {
    console.error('搜索索引初始化失败:', err)
    initialized = false
  }
}

/** 全文搜索，返回按相关度排序的文章列表 */
export function searchArticles(keyword: string, limit = 20): ArticleDoc[] {
  if (!documentIndex || !keyword.trim()) return []

  try {
    const rawResults: Array<{ field: string; result: number[] }> =
      documentIndex.search(keyword, { limit, suggest: true }) || []

    // 收集所有匹配的 id 并按出现次数排序（出现越多相关度越高）
    const scoreMap = new Map<number, number>()
    for (const fieldResult of rawResults) {
      for (const id of fieldResult.result) {
        scoreMap.set(id, (scoreMap.get(id) || 0) + 1)
      }
    }

    // 按相关度降序排列
    const sorted = [...scoreMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => articleDocs.find((a) => a.id === id) as ArticleDoc | undefined)
      .filter((d): d is ArticleDoc => !!d)

    return sorted
  } catch {
    return []
  }
}

/** 强制重建索引 */
export async function rebuildIndex() {
  initialized = false
  articleDocs = []
  documentIndex = null
  return initSearchIndex()
}
