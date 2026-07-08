import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, Pagination } from '@heroui/react'
import { Icon } from '@iconify/react'
import { searchArticles } from '@/api/article'
import SeoMeta from '@/components/SeoMeta'
import ArticleCard from '@/components/ArticleCard'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const navigate = useNavigate()
  const [articles, setArticles] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    if (!q) return
    searchArticles({ pageNum: page, pageSize, keyword: q }).then((res: any) => {
      setArticles(res.data?.list || [])
      setTotal(res.data?.total || 0)
    })
  }, [q, page])

  const handlePageChange = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const searchTitle = q ? `搜索：${q}` : '搜索'
  const searchDescription = q
    ? `在木芒果博客中搜索“${q}”的结果，涵盖前端开发、后端架构等技术文章。`
    : '搜索木芒果博客中的全部技术文章与生活记录。'

  return (
    <div className="space-y-4">
      <SeoMeta
        title={searchTitle}
        description={searchDescription}
        keywords={q ? `${q},木芒果,个人博客,技术博客` : undefined}
      />
      <h1 className="text-2xl font-bold mb-4">
        <Icon icon="mdi:magnify" className="inline text-[#87CEEB]" /> 搜索结果：{q || '—'}
      </h1>
      {articles.length === 0 && (
        <Card className="rounded-2xl">
          <CardBody className="p-12 text-center text-gray-500">
            没有找到相关文章
          </CardBody>
        </Card>
      )}
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onClick={() => navigate(`/article/${article.id}`)}
        />
      ))}
      {total > pageSize && (
        <div className="flex justify-center pt-4">
          <Pagination
            total={Math.ceil(total / pageSize)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </div>
      )}
    </div>
  )
}
