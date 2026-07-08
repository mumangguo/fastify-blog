import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'

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
