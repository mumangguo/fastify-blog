import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import FrontLayout from '@/components/layout/FrontLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import HomePage from '@/pages/front/HomePage'
import ArticleListPage from '@/pages/front/ArticleListPage'
import ArticleDetailPage from '@/pages/front/ArticleDetailPage'
import SearchPage from '@/pages/front/SearchPage'
import AboutPage from '@/pages/front/AboutPage'
import LoginPage from '@/pages/admin/LoginPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import ArticleManagePage from '@/pages/admin/ArticleManagePage'
import ArticleEditPage from '@/pages/admin/ArticleEditPage'
import CategoryManagePage from '@/pages/admin/CategoryManagePage'
import TagManagePage from '@/pages/admin/TagManagePage'
import CommentManagePage from '@/pages/admin/CommentManagePage'
import LinkManagePage from '@/pages/admin/LinkManagePage'
import SiteConfigPage from '@/pages/admin/SiteConfigPage'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <FrontLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'articles', element: <ArticleListPage /> },
      { path: 'article/:id', element: <ArticleDetailPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'category/:id', element: <ArticleListPage /> },
      { path: 'tag/:id', element: <ArticleListPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'articles', element: <ArticleManagePage /> },
      { path: 'articles/edit', element: <ArticleEditPage /> },
      { path: 'articles/edit/:id', element: <ArticleEditPage /> },
      { path: 'categories', element: <CategoryManagePage /> },
      { path: 'tags', element: <TagManagePage /> },
      { path: 'comments', element: <CommentManagePage /> },
      { path: 'links', element: <LinkManagePage /> },
      { path: 'settings', element: <SiteConfigPage /> },
    ],
  },
]
