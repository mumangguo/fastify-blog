import { useEffect, useState } from 'react'
import { Card, CardBody, Button, Input, Textarea } from '@heroui/react'
import { addToast } from '@heroui/react'
import { Save } from 'lucide-react'
import AiEditor from '@/components/AiEditor'
import { getSiteConfig, saveSiteConfig, getAboutContent, saveAboutContent } from '@/api/siteConfig'

export default function SiteConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({
    siteTitle: '',
    siteSubtitle: '',
    copyright: '',
  })
  const [aboutContent, setAboutContent] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getSiteConfig().then((res: any) => {
      if (res.data) setConfig((prev) => ({ ...prev, ...res.data }))
    })
    getAboutContent().then((res: any) => {
      setAboutContent(res.data?.content || '')
      setLoaded(true)
    })
  }, [])

  const handleSaveConfig = async () => {
    await saveSiteConfig(config)
    addToast({ title: '保存成功', description: '网站信息已更新', color: 'success', timeout: 3000 })
  }

  const handleSaveAbout = async () => {
    await saveAboutContent(aboutContent)
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
            {loaded ? (
              <AiEditor
                placeholder="编辑关于我内容..."
                value={aboutContent}
                onChange={setAboutContent}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">加载中...</div>
            )}
          </div>
          <Button color="primary" startContent={<Save className="w-4 h-4" />} onPress={handleSaveAbout}>
            保存关于我
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
