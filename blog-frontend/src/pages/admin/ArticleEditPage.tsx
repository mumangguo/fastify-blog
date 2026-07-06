import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem, Chip, addToast } from '@heroui/react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import { Plus, Save } from 'lucide-react'
import { getArticleDetail, addArticle, updateArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import { uploadFile } from '@/api/upload'
import AiAssistant from '@/components/AiAssistant'

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
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const pendingHtmlRef = useRef<string | null>(null)
  const editorRef = useRef<IDomEditor | null>(null)
  const toolbarConfig: Partial<IToolbarConfig> = {}
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
    MENU_CONF: {
      uploadImage: {
        async customUpload(file: File, insertFn: any) {
          const res: any = await uploadFile(file)
          insertFn(res.data?.url, '', res.data?.url)
        },
      },
    },
  }

  useEffect(() => {
    getCategoryList().then((res: any) => setCategories(res.data || []))
    getTagList().then((res: any) => setTags(res.data || []))
    if (isEdit) {
      getArticleDetail(Number(id)).then((res: any) => {
        const d = res.data
        if (!d) return
        const content = d.content || ''
        setForm({
          title: d.title || '',
          summary: d.summary || '',
          coverUrl: d.coverUrl || '',
          content,
          categoryId: d.categoryId != null ? String(d.categoryId) : '',
          tagIds: d.tags?.map((t: any) => t.tag?.id ?? t.tagId) || [],
          status: d.status ?? 1,
        })
        if (editorRef.current && content) {
          try { editorRef.current.setHtml(content) } catch (e) { console.error(e) }
        } else {
          pendingHtmlRef.current = content
        }
      })
    }
  }, [id])

  const handleEditorCreated = (ed: IDomEditor) => {
    setEditor(ed)
    editorRef.current = ed
    if (pendingHtmlRef.current) {
      try { ed.setHtml(pendingHtmlRef.current) } catch (e) { console.error(e) }
      pendingHtmlRef.current = null
    }
  }

  const handleSave = async (status: number) => {
    const data = {
      ...form,
      categoryId: Number(form.categoryId),
      status,
      content: editorRef.current?.getHtml() || form.content,
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
    return editorRef.current?.getText?.() || form.content.replace(/<[^>]+>/g, '') || ''
  }

  /**
   * AI 改写动画：将新内容以打字机方式写入编辑器
   */
  const animateRewrite = useCallback((newText: string) => {
    const ed = editorRef.current
    if (!ed) return

    // 1. 全选当前内容并高亮闪烁
    ed.selectAll()
    const selection = ed.selection
    if (selection) {
      // 添加临时高亮样式
      ed.addMark('bgColor', '#FFE066')
    }

    // 2. 短暂延迟后清除并逐字输入新内容
    setTimeout(() => {
      ed.clear()
      ed.focus()

      let index = 0
      const chars = newText.split('')
      const interval = setInterval(() => {
        if (index >= chars.length) {
          clearInterval(interval)
          setForm((prev: any) => ({ ...prev, content: ed.getHtml() }))
          addToast({ title: 'AI 改写完成', color: 'success', timeout: 2000 })
          return
        }
        // 每批输入 2-3 个字符，模拟快速打字
        const batch = chars.slice(index, index + 2)
        ed.insertText(batch.join(''))
        index += 2
      }, 15)
    }, 600)
  }, [])

  const handleAiApply = (result: string, action: string) => {
    switch (action) {
      case 'title':
        setForm((prev: any) => ({ ...prev, title: result.split('\n')[0].trim() }))
        addToast({ title: '标题已更新', color: 'success', timeout: 2000 })
        break
      case 'summary':
        setForm((prev: any) => ({ ...prev, summary: result }))
        addToast({ title: '摘要已更新', color: 'success', timeout: 2000 })
        break
      case 'polish':
      case 'expand':
      case 'shrink':
        // 正文改写动画效果
        animateRewrite(result)
        break
      case 'continue':
        // 续写：在末尾追加
        editorRef.current?.insertText(result)
        addToast({ title: '续写内容已插入', color: 'success', timeout: 2000 })
        break
      default:
        editorRef.current?.insertText(result)
    }
  }

  // HeroUI Select 的 selectedKeys 必须是 Set 类型
  const categorySelection = form.categoryId ? new Set([String(form.categoryId)]) : new Set<string>()

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
              selectedKeys={categorySelection}
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

          {/* AI 写作助手 */}
          <AiAssistant content={getPlainText()} onApply={handleAiApply} />

          {/* 富文本编辑器 */}
          <div>
            <label className="text-sm font-medium mb-2 block">正文</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" className="border-b border-gray-200" />
              <Editor
                defaultConfig={editorConfig}
                onCreated={handleEditorCreated}
                onChange={(ed) => setForm((prev: any) => ({ ...prev, content: ed.getHtml() }))}
                mode="default"
                style={{ height: '400px', overflowY: 'hidden' }}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
