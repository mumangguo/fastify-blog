import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { Search } from 'lucide-react'
import { getCategoryList } from '@/api/category'
import { getSiteConfig } from '@/api/siteConfig'
import BlogChatBot from '@/components/BlogChatBot'
import SelectionAskMenu from '@/components/SelectionAskMenu'
import GlobalSearch from '@/components/GlobalSearch'

export default function FrontLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<any[]>([])
  const [config, setConfig] = useState<Record<string, string>>({})
  const [searchKey, setSearchKey] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    getCategoryList().then((res: any) => setCategories(res.data || []))
    getSiteConfig().then((res: any) => setConfig(res.data || {}))
  }, [])

  // Ctrl/Cmd + K 快捷键
  const handleOpenSearch = useCallback(() => setSearchOpen(true), [])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSearch = () => {
    if (searchKey.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchKey.trim())}`)
    }
  }

  const navItems = [
    { label: '首页', path: '/' },
    { label: '文章', path: '/articles' },
    { label: '关于我', path: '/about' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-[#87CEEB] flex items-center gap-2">
            <Icon icon="solar:pen-new-square-bold" className="text-2xl" />
            {config.siteTitle || '个人博客'}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.path ? 'text-[#87CEEB]' : 'text-gray-600 hover:text-[#87CEEB]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="text-sm font-medium text-gray-600 hover:text-[#87CEEB] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-all text-sm text-gray-400 min-w-[140px] md:min-w-[200px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>搜索文章...</span>
              <kbd className="hidden md:inline-flex ml-auto px-1.5 py-0.5 rounded border border-gray-200 text-[10px] text-gray-300 leading-none">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p className="mb-2">{config.siteTitle || '个人博客'} - 记录生活与技术</p>
          <p>{config.copyright || '© 2024 All rights reserved.'}</p>
        </div>
      </footer>

      {/* AI 博客分身 */}
      <BlogChatBot />

      {/* 选中文字浮出菜单：可把选段发给博客分身 */}
      <SelectionAskMenu />

      {/* 全局搜索弹窗 */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
