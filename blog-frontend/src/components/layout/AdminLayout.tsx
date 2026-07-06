import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import { LogOut, Menu, X } from 'lucide-react'

const menuItems = [
  { label: '仪表盘', path: '/admin/dashboard', icon: 'mdi:view-dashboard' },
  { label: '文章管理', path: '/admin/articles', icon: 'mdi:file-document-multiple' },
  { label: '分类管理', path: '/admin/categories', icon: 'mdi:folder-open' },
  { label: '标签管理', path: '/admin/tags', icon: 'mdi:tag-multiple' },
  { label: '评论管理', path: '/admin/comments', icon: 'mdi:comment-multiple' },
  { label: '友情链接', path: '/admin/links', icon: 'mdi:link-variant' },
  { label: '系统设置', path: '/admin/settings', icon: 'mdi:cog' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex bg-[#F5F5F7]">
      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* 侧边栏 */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-100 z-50 transition-all duration-300 ${
          collapsed && !mobileOpen ? 'w-0 md:w-16 overflow-hidden' : mobileOpen ? 'w-64' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <span className="font-bold text-[#87CEEB] whitespace-nowrap">管理后台</span>
          <button onClick={() => setMobileOpen(false)} className="md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-[#87CEEB]/10 text-[#87CEEB]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon icon={item.icon} className="text-lg shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button isIconOnly variant="light" size="sm" onPress={() => setMobileOpen(true)} className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <Button isIconOnly variant="light" size="sm" onPress={() => setCollapsed(!collapsed)} className="hidden md:flex">
              <Icon icon="mdi:menu-open" className={`text-lg transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="light" size="sm" onPress={() => navigate('/')} startContent={<Icon icon="mdi:home" />}>
              前台
            </Button>
            <Button variant="light" size="sm" color="danger" onPress={handleLogout} startContent={<LogOut className="w-4 h-4" />}>
              退出
            </Button>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div key={location.pathname} className="page-enter">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
