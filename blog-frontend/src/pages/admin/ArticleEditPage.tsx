import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem, Chip, addToast } from '@heroui/react'
import { Plus, Save, Sparkles, RotateCcw } from 'lucide-react'
import AiEditor from '@/components/AiEditor'
import { getArticleDetail, addArticle, updateArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import { uploadFile } from '@/api/upload'
import { ssePost } from '@/api/ai'

export default function ArticleEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [form, setForm] = useState<any>({
    title: '',
    summary: '',
    coverUrl: '',
    content: '',
    categoryId: '',
    tagIds: [] as number[],
    status: 1,
  })
  // 编辑器内容独立于 form，避免 AiEditor 的 onChange 频繁触发 form 重渲染
  const [editorHtml, setEditorHtml] = useState('')
  const [loaded, setLoaded] = useState(!isEdit)

  useEffect(() => {
    getCategoryList().then((res: any) => setCategories(res.data || []))
    getTagList().then((res: any) => setTags(res.data || []))
    if (isEdit) {
      getArticleDetail(Number(id)).then((res: any) => {
        const d = res.data
        if (!d) { setLoaded(true); return }
        setForm({
          title: d.title || '',
          summary: d.summary || '',
          coverUrl: d.coverUrl || '',
          content: d.content || '',
          categoryId: d.categoryId != null ? String(d.categoryId) : '',
          tagIds: d.tags?.map((t: any) => t.tag?.id ?? t.tagId) || [],
          status: d.status ?? 1,
        })
        setEditorHtml(d.content || '')
        setLoaded(true)
      })
    }
  }, [id])

  const handleSave = async (status: number) => {
    const data = {
      ...form,
      categoryId: Number(form.categoryId),
      status,
      content: editorHtml,
    }
    if (isEdit) {
      await updateArticle({ id: Number(id), ...data })
    } else {
      await addArticle(data)
    }
    navigate('/admin/articles')
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const res: any = await uploadFile(file)
    setForm((prev: any) => ({ ...prev, coverUrl: res.data?.url }))
  }

  const getPlainText = () => {
    return editorHtml ? editorHtml.replace(/<[^>]+>/g, '') : ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEdit ? '编辑文章' : '新增文章'}</h1>
        <div className="flex gap-2">
          <Button variant="flat" onPress={() => navigate('/admin/articles')}>取消</Button>
          <Button color="primary" variant="flat" startContent={<Save className="w-4 h-4" />} onPress={() => handleSave(0)}>
            存草稿
          </Button>
          <Button color="primary" startContent={<Save className="w-4 h-4" />} onPress={() => handleSave(1)}>
            发布
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-5 space-y-4">
          {/* AI 标题/摘要生成（作用于表单字段，保留独立入口） */}
          <AiTitleSummary
            content={getPlainText()}
            onApplyTitle={(t) => {
              setForm((prev: any) => ({ ...prev, title: t.split('\n')[0].trim() }))
              addToast({ title: '标题已更新', color: 'success', timeout: 2000 })
            }}
            onApplySummary={(s) => {
              setForm((prev: any) => ({ ...prev, summary: s }))
              addToast({ title: '摘要已更新', color: 'success', timeout: 2000 })
            }}
          />

          <Input label="标题" value={form.title} onValueChange={(v) => setForm((prev: any) => ({ ...prev, title: v }))} />
          <Textarea label="摘要" value={form.summary} onValueChange={(v) => setForm((prev: any) => ({ ...prev, summary: v }))} />

          {/* 封面上传 */}
          <div>
            <label className="text-sm font-medium mb-2 block">封面图</label>
            <div className="flex items-center gap-3">
              {form.coverUrl && <img src={form.coverUrl} alt="cover" className="w-24 h-24 object-cover rounded-xl" />}
              <Button variant="flat" onPress={() => document.getElementById('coverInput')?.click()}>
                <Plus className="w-4 h-4 mr-1" /> 上传封面
              </Button>
              <input id="coverInput" type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="分类"
              selectedKeys={form.categoryId ? new Set([String(form.categoryId)]) : new Set<string>()}
              onSelectionChange={(s) => {
                const keys = s as Set<string>
                const first = keys.values().next().value
                setForm((prev: any) => ({ ...prev, categoryId: first || '' }))
              }}
            >
              {categories.map((c) => (
                <SelectItem key={String(c.id)}>{c.name}</SelectItem>
              ))}
            </Select>
            <div>
              <label className="text-sm font-medium mb-2 block">标签</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    color={form.tagIds.includes(tag.id) ? 'primary' : 'default'}
                    variant={form.tagIds.includes(tag.id) ? 'solid' : 'flat'}
                    className="cursor-pointer"
                    onClick={() => {
                      const ids = form.tagIds.includes(tag.id)
                        ? form.tagIds.filter((tid: number) => tid !== tag.id)
                        : [...form.tagIds, tag.id]
                      setForm((prev: any) => ({ ...prev, tagIds: ids }))
                    }}
                  >
                    {tag.name}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          {/* 富文本编辑器（AiEditor，内置 AI 续写/润色/扩写/精简） */}
          <div>
            <label className="text-sm font-medium mb-2 block">正文</label>
              {loaded ? (
                <AiEditor
                  placeholder="请输入正文内容..."
                  value={editorHtml}
                  onChange={setEditorHtml}
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-400">加载中...</div>
              )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

/** AI 标题/摘要生成（作用于表单字段） */
function AiTitleSummary({
  content,
  onApplyTitle,
  onApplySummary,
}: {
  content: string
  onApplyTitle: (text: string) => void
  onApplySummary: (text: string) => void
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const abortRef = useRef<(() => void) | null>(null)

  const handleAction = (action: 'title' | 'summary') => {
    if (!content.trim()) {
      addToast({ title: '提示', description: '请先在编辑器中输入一些内容', color: 'warning', timeout: 2000 })
      return
    }
    if (abortRef.current) {
      abortRef.current()
      abortRef.current = null
    }
    setLoading(action)
    let fullText = ''
    abortRef.current = ssePost(
      '/ai/writer',
      { action, content },
      (delta) => {
        fullText += delta
      },
      () => {
        setLoading(null)
        abortRef.current = null
        if (action === 'title') onApplyTitle(fullText)
        else onApplySummary(fullText)
      },
      (err) => {
        setLoading(null)
        abortRef.current = null
        addToast({ title: '请求失败', description: err, color: 'danger', timeout: 3000 })
      }
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
      <Sparkles className="w-4 h-4 text-[#87CEEB] shrink-0" />
      <span className="text-sm font-medium shrink-0">AI 辅助</span>
      <div className="flex gap-2 ml-auto">
        <Button
          size="sm"
          variant="flat"
          isDisabled={loading !== null}
          onPress={() => handleAction('title')}
        >
          {loading === 'title' ? (
            <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3 animate-spin" />生成中...</span>
          ) : '生成标题'}
        </Button>
        <Button
          size="sm"
          variant="flat"
          isDisabled={loading !== null}
          onPress={() => handleAction('summary')}
        >
          {loading === 'summary' ? (
            <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3 animate-spin" />生成中...</span>
          ) : '生成摘要'}
        </Button>
      </div>
    </div>
  )
}
