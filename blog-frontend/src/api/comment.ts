import request from '@/lib/request'

export const submitComment = (data: any) => request.post('/comment', data)
export const getArticleComments = (id: number) => request.get(`/article/${id}/comments`)
export const getCommentPage = (data: any) => request.post('/comment/page', data)
export const deleteComment = (id: number) => request.delete(`/comment/${id}`)
