import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import { getSiteConfig, getAboutContent } from '@/api/siteConfig'
import { getArticleList } from '@/api/article'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import SeoMeta from '@/components/SeoMeta'
import { useInView } from '@/hooks/useInView'
import { AboutPageSections } from './AboutPageSections'

interface StatItem {
  label: string
  value: number | string
  icon: string
  color: string
}

function Section({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const [ref, visible] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

export default function AboutPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<Record<string, string>>({})
  const [aboutHtml, setAboutHtml] = useState('')
  const [articleCount, setArticleCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [tagCount, setTagCount] = useState(0)
  const [featured, setFeatured] = useState<any[]>([])
  const [earliestDate, setEarliestDate] = useState<Date | null>(null)

  useEffect(() => {
    getSiteConfig().then((res: any) => setConfig(res.data || {})).catch(() => {})
    getAboutContent().then((res: any) => setAboutHtml(res.data?.content || '')).catch(() => {})
    getCategoryList().then((res: any) => setCategoryCount((res.data || []).length)).catch(() => {})
    getTagList().then((res: any) => setTagCount((res.data || []).length)).catch(() => {})
    // 拉最近一批文章：用作总数、精选、最早时间
    getArticleList({ pageNum: 1, pageSize: 50 })
      .then((res: any) => {
        const list = res.data?.list || []
        setArticleCount(res.data?.total || list.length)
        // 精选：有封面的优先，最多 3 篇
        const picked = [...list].sort((a, b) => (b.coverUrl ? 1 : 0) - (a.coverUrl ? 1 : 0)).slice(0, 3)
        setFeatured(picked)
        if (list.length > 0) {
          const oldest = list.reduce((min: any, a: any) =>
            new Date(a.createdTime) < new Date(min.createdTime) ? a : min
          )
          setEarliestDate(new Date(oldest.createdTime))
        }
      })
      .catch(() => {})
  }, [])

  const siteName = config.siteTitle || '木芒果'
  const siteSubtitle = config.siteSubtitle || '记录技术成长，分享生活点滴'
  const initial = siteName.charAt(0).toUpperCase()

  // 写作天数：从最早一篇文章算起
  const writingDays = useMemo(() => {
    if (!earliestDate) return 0
    return Math.max(1, Math.floor((Date.now() - earliestDate.getTime()) / 86400000))
  }, [earliestDate])

  const stats: StatItem[] = [
    { label: '篇文章', value: articleCount, icon: 'solar:document-text-bold', color: 'text-[#87CEEB]' },
    { label: '个分类', value: categoryCount, icon: 'solar:folder-2-bold', color: 'text-emerald-500' },
    { label: '个标签', value: tagCount, icon: 'solar:hashtag-bold', color: 'text-amber-500' },
    { label: '天写作', value: writingDays, icon: 'solar:calendar-bold', color: 'text-rose-500' },
  ]

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8">
      <SeoMeta
        title="关于我"
        description={`了解 ${siteName}——${siteSubtitle}`}
      />

      {/* Hero 区 */}
      <div className="relative overflow-hidden">
        {/* 渐变背景 + 装饰球 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E0F4FC] via-white to-[#F5FBFE]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#87CEEB]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />

        <div className="relative px-6 py-20 md:py-28 max-w-4xl mx-auto text-center">
          <Section>
            {/* 头像：首字母 + 光晕 */}
            <div className="inline-flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#5DB8E0] text-white text-5xl md:text-6xl font-bold shadow-xl shadow-[#87CEEB]/30 mb-6 ring-4 ring-white">
              {initial}
            </div>
          </Section>
          <Section delay={80}>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-gray-900">
              你好，我是{siteName}
            </h1>
          </Section>
          <Section delay={160}>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {siteSubtitle}
            </p>
          </Section>
          <Section delay={240}>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Button color="primary" size="lg" onPress={() => navigate('/articles')} className="rounded-full">
                <Icon icon="solar:book-bold" className="w-4 h-4 mr-1" />
                看看我的文章
              </Button>
              <Button
                variant="flat"
                size="lg"
                onPress={() => {
                  const el = document.getElementById('about-story')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="rounded-full"
              >
                <Icon icon="solar:altitude-bold" className="w-4 h-4 mr-1" />
                了解更多
              </Button>
            </div>
          </Section>
        </div>
      </div>

      {/* 内容主体 */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-20 py-16">
        {/* 数据卡片 */}
        <Section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <Card key={i} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="p-5 text-center">
                  <Icon icon={s.icon} className={`w-8 h-8 mx-auto mb-2 ${s.color}`} />
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 tabular-nums">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>

        {/* 后续模块：技术栈、时间线、精选文章、关于我 HTML —— 由 AboutPageSections 提供 */}
        <AboutPageSections
          featured={featured}
          aboutHtml={aboutHtml}
          onArticleClick={(id) => navigate(`/article/${id}`)}
        />
      </div>
    </div>
  )
}
