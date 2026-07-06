import request from '@/lib/request'

export const getLinkList = () => request.get('/link/list')
export const getLinkPage = (data: any) => request.post('/link/page', data)
export const addLink = (data: any) => request.post('/link/add', data)
export const updateLink = (data: any) => request.put('/link/update', data)
export const deleteLink = (id: number) => request.delete(`/link/${id}`)
