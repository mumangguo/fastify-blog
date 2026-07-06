import request from '@/lib/request'

export const getStats = () => request.get('/dashboard/stats')
export const getTrend = () => request.get('/dashboard/trend')
export const getRecentComments = () => request.get('/dashboard/recent-comments')
