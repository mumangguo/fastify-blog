import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardBody, Chip, Button, Input, Textarea, addToast } from '@heroui/react'
import { Icon } from '@iconify/react'
import { Eye, Calendar, User, Mail, Globe, Send } from 'lucide-react'
import { getArticleDetail } from '@/api/article'
import { getArticleComments, submitComment } from '@/api/comment'
import SeoMeta from '@/components/SeoMeta'

export default function ArticleDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [commentForm, setCommentForm] = useState({ nickname: '', email: '', website: '', content: '' })

  useEffect(() => {
    if (!id) return
    getArticleDetail(Number(id)).then((res: any) => setArticle(res.data))
    loadComments()
  }, [id])

  const loadComments = () => {
    if (!id) return
    getArticleComments(Number(id)).then((res: any) => setComments(res.data || []))
  }

  const handleSubmitComment = async () => {
    if (!commentForm.nickname || !commentForm.email || !commentForm.content) return
    try {
      await submitComment({ ...commentForm, articleId: Number(id) })
      setCommentForm({ nickname: '', email: '', website: '', content: '' })
      addToast({ title: '评论已提交', color: 'success', timeout: 2000 })
      loadComments()
    } catch (err: any) {
      addToast({ title: '评论提交失败', description: err || '请稍后重试', color: 'danger', timeout: 3000 })
    }
  }

  if (!article) return <div className="text-center py-20">加载中...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SeoMeta
        title={article.title}
        description={article.summary || article.content?.replace(/<[^>]+>/g, '').slice(0, 160) || ''}
        keywords={article.tags?.map((t: any) => t.tag.name).join(',') || ''}
        image={article.coverUrl || undefined}
        type="article"
      />
      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(article.createdTime).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.viewCount}
            </span>
            {article.category && (
              <Chip size="sm" color="primary" variant="flat">{article.category.name}</Chip>
            )}
          </div>
          {article.coverUrl && (
            <img src={article.coverUrl} alt={article.title} className="w-full h-64 object-cover rounded-xl mb-6" />
          )}
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
            {article.tags?.map((t: any) => (
              <Chip key={t.tag.id} size="sm" color="primary" variant="flat">{t.tag.name}</Chip>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 评论区 */}
      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Icon icon="mdi:comment-multiple" className="text-[#87CEEB]" />
            评论 ({comments.length})
          </h3>

          {/* 评论表单 */}
          <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="昵称 *" value={commentForm.nickname} onValueChange={(v) => setCommentForm({ ...commentForm, nickname: v })} />
              <Input placeholder="邮箱 *" value={commentForm.email} onValueChange={(v) => setCommentForm({ ...commentForm, email: v })} />
              <Input placeholder="网站" value={commentForm.website} onValueChange={(v) => setCommentForm({ ...commentForm, website: v })} />
            </div>
            <Textarea
              placeholder="写下你的评论..."
              value={commentForm.content}
              onValueChange={(v) => setCommentForm({ ...commentForm, content: v })}
            />
            <Button color="primary" onPress={handleSubmitComment} startContent={<Send className="w-4 h-4" />}>
              发表评论
            </Button>
          </div>

          {/* 评论列表 */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-[#87CEEB] rounded-full flex items-center justify-center text-white shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{comment.nickname}</span>
                    {comment.location && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Icon icon="mdi:map-marker-outline" className="w-3 h-3" />
                        {comment.location}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{new Date(comment.createdTime).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
