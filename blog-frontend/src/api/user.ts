import request from '@/lib/request'

export const login = (data: { username: string; password: string }) =>
  request.post('/user/login', data)

export const register = (data: { username: string; password: string }) =>
  request.post('/user/register', data)

export const getProfile = () => request.get('/user/profile')

export const getInitStatus = () => request.get('/user/init-status')

export const initAdmin = (username?: string) =>
  request.post('/user/init', { username })
