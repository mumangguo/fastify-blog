import request from '@/lib/request'

export const getArticleList = (data: any) => request.post('/article/list', data)
export const getArticleDetail = (id: number) => request.get(`/article/${id}`)
export const searchArticles = (data: any) => request.post('/article/search', data)
export const getArticlePage = (data: any) => request.post('/article/page', data)
export const addArticle = (data: any) => request.post('/article/add', data)
export const updateArticle = (data: any) => request.put('/article/update', data)
export const deleteArticle = (id: number) => request.delete(`/article/${id}`)
export const updateArticleStatus = (id: number, status: number) =>
  request.put(`/article/${id}/status`, { status })
