import { useEffect, useState } from 'react'
import { Card, CardBody } from '@heroui/react'
import { getAboutContent } from '@/api/siteConfig'
import SeoMeta from '@/components/SeoMeta'

export default function AboutPage() {
  const [content, setContent] = useState('')

  useEffect(() => {
    getAboutContent().then((res: any) => setContent(res.data?.content || ''))
  }, [])

  return (
    <div className="max-w-3xl mx-auto">
      <SeoMeta
        title="关于我"
        description="了解木芒果 - 一个热爱技术的开发者，记录编程成长之路。"
      />
      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-6 md:p-10">
          <h1 className="text-2xl font-bold mb-6 text-center">关于我</h1>
          {content ? (
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className="text-gray-500 text-center py-10">暂无内容</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
