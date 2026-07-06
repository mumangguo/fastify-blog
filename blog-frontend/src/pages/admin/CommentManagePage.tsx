import { useEffect, useState } from 'react'
import { Card, CardBody, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from '@heroui/react'
import { Icon } from '@iconify/react'
import { Trash2, Search } from 'lucide-react'
import { getCommentPage, deleteComment } from '@/api/comment'

export default function CommentManagePage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const pageSize = 10

  useEffect(() => { loadData() }, [page])

  const loadData = () => {
    getCommentPage({ pageNum: page, pageSize, keyword }).then((res: any) => {
      setData(res.data?.list || [])
      setTotal(res.data?.total || 0)
    })
  }

  const handleDelete = async (id: number) => {
    await deleteComment(id)
    loadData()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">评论管理</h1>
      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-5">
          <div className="flex gap-2 mb-4">
            <Input placeholder="搜索昵称或内容..." value={keyword} onValueChange={setKeyword} className="w-64" endContent={<Search className="w-4 h-4 text-gray-400" />} />
            <Button color="primary" onPress={() => { setPage(1); loadData() }}>查询</Button>
          </div>
          <Table aria-label="评论列表">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>昵称</TableColumn>
              <TableColumn>邮箱</TableColumn>
              <TableColumn>内容</TableColumn>
              <TableColumn>IP / 归属地</TableColumn>
              <TableColumn>文章</TableColumn>
              <TableColumn>时间</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody items={data}>
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.nickname}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.content}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {item.ip && <div className="text-gray-500">{item.ip}</div>}
                      {item.location && <div className="text-gray-400">{item.location}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{item.article?.title}</TableCell>
                  <TableCell>{new Date(item.createdTime).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {total > pageSize && <div className="flex justify-end mt-4"><Pagination total={Math.ceil(total / pageSize)} page={page} onChange={setPage} color="primary" /></div>}
        </CardBody>
      </Card>
    </div>
  )
}
