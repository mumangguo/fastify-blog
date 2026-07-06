import { useEffect, useState, useRef } from 'react'
import { Card, CardBody, Button, Input, Textarea } from '@heroui/react'
import { addToast } from '@heroui/react'
import { Save } from 'lucide-react'
import { getSiteConfig, saveSiteConfig, getAboutContent, saveAboutContent } from '@/api/siteConfig'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

export default function SiteConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({
    siteTitle: '',
    siteSubtitle: '',
    copyright: '',
  })
  const [aboutContent, setAboutContent] = useState('')
  const [aboutEditor, setAboutEditor] = useState<IDomEditor | null>(null)
  const pendingHtmlRef = useRef<string | null>(null)
  const editorRef = useRef<IDomEditor | null>(null)
  const toolbarConfig: Partial<IToolbarConfig> = {}
  const editorConfig: Partial<IEditorConfig> = { placeholder: '编辑关于我内容...' }

  useEffect(() => {
    getSiteConfig().then((res: any) => {
      if (res.data) setConfig({ ...config, ...res.data })
    })
    getAboutContent().then((res: any) => {
      const content = res.data?.content || ''
      setAboutContent(content)
      // 双重保障：编辑器已就绪就直接设置，否则缓存
      if (editorRef.current && content) {
        try {
          editorRef.current.setHtml(content)
        } catch (e) {
          console.error('Failed to set editor HTML:', e)
        }
      } else {
        pendingHtmlRef.current = content
      }
    })
  }, [])

  const handleEditorCreated = (ed: IDomEditor) => {
    setAboutEditor(ed)
    editorRef.current = ed
    if (pendingHtmlRef.current) {
      try {
        ed.setHtml(pendingHtmlRef.current)
      } catch (e) {
        console.error('Failed to set editor HTML:', e)
      }
      pendingHtmlRef.current = null
    }
  }

  const handleSaveConfig = async () => {
    await saveSiteConfig(config)
    addToast({ title: '保存成功', description: '网站信息已更新', color: 'success', timeout: 3000 })
  }

  const handleSaveAbout = async () => {
    await saveAboutContent(editorRef.current?.getHtml() || aboutContent)
    addToast({ title: '保存成功', description: '关于我内容已更新', color: 'success', timeout: 3000 })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">系统设置</h1>

      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-5 space-y-4">
          <h2 className="text-lg font-bold">网站信息</h2>
          <Input label="网站标题" value={config.siteTitle} onValueChange={(v) => setConfig({ ...config, siteTitle: v })} />
          <Input label="网站副标题" value={config.siteSubtitle} onValueChange={(v) => setConfig({ ...config, siteSubtitle: v })} />
          <Input label="版权信息" value={config.copyright} onValueChange={(v) => setConfig({ ...config, copyright: v })} />
          <Button color="primary" startContent={<Save className="w-4 h-4" />} onPress={handleSaveConfig}>
            保存网站信息
          </Button>
        </CardBody>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-5 space-y-4">
          <h2 className="text-lg font-bold">关于我</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <Toolbar editor={aboutEditor} defaultConfig={toolbarConfig} mode="default" className="border-b border-gray-200" />
            <Editor
              defaultConfig={editorConfig}
              onCreated={handleEditorCreated}
              onChange={(editor) => setAboutContent(editor.getHtml())}
              mode="default"
              style={{ height: '300px', overflowY: 'hidden' }}
            />
          </div>
          <Button color="primary" startContent={<Save className="w-4 h-4" />} onPress={handleSaveAbout}>
            保存关于我
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
