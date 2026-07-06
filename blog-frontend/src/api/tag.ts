import request from '@/lib/request'

export const getTagList = () => request.get('/tag/list')
export const getTagPage = (data: any) => request.post('/tag/page', data)
export const addTag = (data: any) => request.post('/tag/add', data)
export const updateTag = (data: any) => request.put('/tag/update', data)
export const deleteTag = (id: number) => request.delete(`/tag/${id}`)
