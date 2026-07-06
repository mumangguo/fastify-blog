import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Input, Button, addToast } from '@heroui/react'
import { Icon } from '@iconify/react'
import { login } from '@/api/user'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!form.username || !form.password) return
    setLoading(true)
    try {
      const res: any = await login(form)
      localStorage.setItem('token', res.data.token)
      navigate('/admin/dashboard')
    } catch (e: any) {
      addToast({ title: '登录失败', description: e || '请检查用户名和密码', color: 'danger', timeout: 3000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <Icon icon="solar:pen-new-square-bold" className="text-4xl text-[#87CEEB] mx-auto mb-3" />
            <h1 className="text-2xl font-bold">管理后台登录</h1>
          </div>
          <div className="space-y-4">
            <Input
              label="用户名"
              value={form.username}
              onValueChange={(v) => setForm({ ...form, username: v })}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Input
              label="密码"
              type="password"
              value={form.password}
              onValueChange={(v) => setForm({ ...form, password: v })}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button color="primary" className="w-full" isLoading={loading} onPress={handleLogin}>
              登录
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
