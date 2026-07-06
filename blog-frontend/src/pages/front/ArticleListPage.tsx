import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Pagination } from '@heroui/react'
import { getArticleList } from '@/api/article'
import ArticleCard from '@/components/ArticleCard'
import { SkeletonArticleList } from '@/components/Skeleton'

export default function ArticleListPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const tagId = searchParams.get('tagId')
  const navigate = useNavigate()
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
      <h1 className="text-2xl font-bold mb-4">
        {id ? '分类文章' : tagId ? '标签文章' : '全部文章'}
      </h1>
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
