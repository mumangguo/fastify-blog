import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Clarity from '@microsoft/clarity'
import App from './App'
import './index.css'

// Microsoft Clarity 行为分析。仅在生产环境启用，避免本地开发被记录。
// 项目 ID 通过环境变量注入，允许不同环境（预发/生产）用不同 project。
const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID
if (import.meta.env.PROD && clarityProjectId) {
  Clarity.init(clarityProjectId)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <HelmetProvider>
      <HeroUIProvider>
        <ToastProvider placement="top-center" maxVisibleToasts={3} />
        <App />
      </HeroUIProvider>
    </HelmetProvider>
  </BrowserRouter>
)
