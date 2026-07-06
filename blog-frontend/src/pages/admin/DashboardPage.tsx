import { useEffect, useState } from 'react'
import { Card, CardBody } from '@heroui/react'
import { Icon } from '@iconify/react'
import { getStats, getTrend, getRecentComments } from '@/api/dashboard'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({})
  const [trend, setTrend] = useState<any[]>([])
  const [recentComments, setRecentComments] = useState<any[]>([])

  useEffect(() => {
    getStats().then((res: any) => setStats(res.data || {}))
    getTrend().then((res: any) => setTrend(res.data || []))
    getRecentComments().then((res: any) => setRecentComments(res.data || []))
  }, [])

  const statCards = [
    { label: '文章总数', value: stats.articleCount || 0, icon: 'mdi:file-document-multiple', color: 'bg-blue-50 text-blue-500' },
    { label: '分类总数', value: stats.categoryCount || 0, icon: 'mdi:folder-open', color: 'bg-green-50 text-green-500' },
    { label: '标签总数', value: stats.tagCount || 0, icon: 'mdi:tag-multiple', color: 'bg-purple-50 text-purple-500' },
    { label: '评论总数', value: stats.commentCount || 0, icon: 'mdi:comment-multiple', color: 'bg-orange-50 text-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon icon={card.icon} className="text-2xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 趋势 */}
        <Card className="rounded-2xl shadow-sm">
          <CardBody className="p-5">
            <h3 className="font-bold mb-4">最近7天发布趋势</h3>
            <div className="flex items-end gap-3 h-32">
              {trend.map((item) => (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#87CEEB] rounded-t-lg transition-all"
                    style={{ height: `${Math.max(item.count * 20, 4)}px` }}
                  />
                  <span className="text-xs text-gray-400">{item.date.slice(5)}</span>
                  <span className="text-xs font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* 最新评论 */}
        <Card className="rounded-2xl shadow-sm">
          <CardBody className="p-5">
            <h3 className="font-bold mb-4">最新评论</h3>
            <div className="space-y-3">
              {recentComments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-[#87CEEB] rounded-full flex items-center justify-center text-white text-xs shrink-0">
                    {comment.nickname?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{comment.nickname}</p>
                    <p className="text-xs text-gray-500 truncate">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{comment.article?.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
