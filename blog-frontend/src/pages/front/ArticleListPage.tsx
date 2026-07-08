import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Pagination } from '@heroui/react'
import { getArticleList } from '@/api/article'
import SeoMeta from '@/components/SeoMeta'
import ArticleCard from '@/components/ArticleCard'
import { SkeletonArticleList } from '@/components/Skeleton'

export default function ArticleListPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const tagId = searchParams.get('tagId')
  const navigate = useNavigate()
  // 当前列表类型：分类 / 标签 / 全量
  const listType = id ? 'category' : tagId ? 'tag' : 'all'
  const listTypeName = id ? '分类文章' : tagId ? '标签文章' : '全部文章'
  const metaDescription =
    id || tagId
      ? `浏览木芒果博客的${listTypeName}，涵盖前端开发、后端架构、数据库等技术领域。`
      : '浏览木芒果博客的全部文章，涵盖前端开发、后端架构、数据库设计等技术领域。'

  const [articles, setArticles] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 10

  useEffect(() => {
    setLoading(true)
    const params: any = { pageNum: page, pageSize }
    if (id) params.categoryId = Number(id)
    if (tagId) params.tagId = Number(tagId)
    getArticleList(params)
      .then((res: any) => {
        setArticles(res.data?.list || [])
        setTotal(res.data?.total || 0)
      })
      .finally(() => setLoading(false))
  }, [page, id, tagId])

  const handlePageChange = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-4">
      <SeoMeta
        title={listTypeName}
        description={metaDescription}
      />
      <h1 className="text-2xl font-bold mb-4">{listTypeName}</h1>
      {loading ? (
        <SkeletonArticleList count={pageSize} />
      ) : (
        articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => navigate(`/article/${article.id}`)}
          />
        ))
      )}
      {!loading && total > pageSize && (
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
