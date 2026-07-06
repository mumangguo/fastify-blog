import request from '@/lib/request'

export const getCategoryList = () => request.get('/category/list')
export const getCategoryPage = (data: any) => request.post('/category/page', data)
export const addCategory = (data: any) => request.post('/category/add', data)
export const updateCategory = (data: any) => request.put('/category/update', data)
export const deleteCategory = (id: number) => request.delete(`/category/${id}`)
