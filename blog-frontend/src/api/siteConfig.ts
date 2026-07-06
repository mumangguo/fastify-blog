import request from '@/lib/request'

export const getSiteConfig = () => request.get('/site-config')
export const getAboutContent = () => request.get('/site-config/about')
export const saveSiteConfig = (data: any) => request.post('/site-config', data)
export const saveAboutContent = (content: string) =>
  request.post('/site-config/about', { content })
