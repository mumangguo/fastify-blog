import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Chip, Button, addToast } from '@heroui/react'
import { Icon } from '@iconify/react'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import { getArticleList } from '@/api/article'
import { getInitStatus, initAdmin } from '@/api/user'
import SeoMeta from '@/components/SeoMeta'
import ArticleCard from '@/components/ArticleCard'

export default function HomePage() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [initInfo, setInitInfo] = useState<{ username: string; password: string; message: string } | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    getArticleList({ pageNum: 1, pageSize: 6 }).then((res: any) => setArticles(res.data?.list || []))
    getCategoryList().then((res: any) => setCategories(res.data || []))
    getTagList().then((res: any) => setTags(res.data || []))

    // 检查系统是否已初始化管理员
    getInitStatus().then((res: any) => {
      setChecking(false)
      if (!res.data?.initialized) {
        handleInitAdmin()
      }
    }).catch(() => setChecking(false))
  }, [])

  const handleInitAdmin = () => {
    initAdmin().then((res: any) => {
      if (res.data?.password) {
        setInitInfo(res.data)
      }
    }).catch(() => {})
  }

  const handleCopyPassword = () => {
    if (initInfo) {
      navigator.clipboard.writeText(initInfo.password)
      addToast({ title: '密码已复制到剪贴板', color: 'success', timeout: 2000 })
    }
  }

  const handleCloseInitBanner = () => {
    setInitInfo(null)
  }

  return (
    <div className="space-y-6">
      <SeoMeta
        title="首页"
        description="木芒果的个人博客，记录技术成长，分享编程心得与生活点滴。涵盖前端开发、后端架构、数据库设计等技术领域。"
      />

      {/* 管理员初始化提示 */}
      {initInfo && (
        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardBody className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="mdi:shield-key" className="text-amber-500 text-xl" />
                  <h3 className="font-bold text-amber-800">管理员账户已初始化</h3>
                </div>
                <div className="bg-white rounded-lg p-3 mb-2 border border-amber-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">用户名：</span>
                      <span className="font-mono font-bold text-gray-800">{initInfo.username}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">密码：</span>
                      <span className="font-mono font-bold text-red-600">{initInfo.password}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-amber-700 mb-2">{initInfo.message}</p>
                <div className="flex gap-2">
                  <Button size="sm" color="warning" variant="flat" onPress={handleCopyPassword}>
                    <Icon icon="mdi:content-copy" className="w-3.5 h-3.5 mr-1" />
                    复制密码
                  </Button>
                  <Button size="sm" variant="flat" onPress={() => navigate('/login')}>
                    前往登录
                  </Button>
                </div>
              </div>
              <button onClick={handleCloseInitBanner} className="text-gray-400 hover:text-gray-600 shrink-0">
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 欢迎横幅 */}
      <Card className="bg-[#87CEEB] text-white border-0 shadow-lg">
        <CardBody className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">欢迎来到我的博客</h1>
          <p className="text-white/90 text-lg">记录技术成长，分享生活点滴</p>
        </CardBody>
      </Card>

      {/* Bento Grid 布局 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 最新文章大卡片 */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Icon icon="mdi:fire" className="text-[#87CEEB]" />
            最新文章
          </h2>
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              compact
              onClick={() => navigate(`/article/${article.id}`)}
            />
          ))}
          <div className="text-center pt-2">
            <Button color="primary" variant="flat" onPress={() => navigate('/articles')}>
              查看更多文章
            </Button>
          </div>
        </div>

        {/* 侧边小卡片 */}
        <div className="space-y-4">
          {/* 分类 */}
          <Card className="rounded-2xl shadow-sm">
            <CardBody className="p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Icon icon="mdi:folder-open" className="text-[#87CEEB]" />
                分类
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Chip
                    key={cat.id}
                    variant="flat"
                    className="cursor-pointer"
                    onClick={() => navigate(`/category/${cat.id}`)}
                  >
                    {cat.name}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* 标签云 */}
          <Card className="rounded-2xl shadow-sm">
            <CardBody className="p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Icon icon="mdi:tag-multiple" className="text-[#87CEEB]" />
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="cursor-pointer"
                    onClick={() => navigate(`/tag/${tag.id}`)}
                  >
                    {tag.name}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
