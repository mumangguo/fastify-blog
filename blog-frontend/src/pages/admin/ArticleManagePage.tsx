import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { Icon } from '@iconify/react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { getArticlePage, deleteArticle, updateArticleStatus } from '@/api/article'
import { getCategoryList } from '@/api/category'

export default function ArticleManagePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const pageSize = 10

  useEffect(() => {
    loadData()
    getCategoryList().then((res: any) => setCategories(res.data || []))
  }, [page])

  const loadData = () => {
    getArticlePage({ pageNum: page, pageSize, keyword }).then((res: any) => {
      setData(res.data?.list || [])
      setTotal(res.data?.total || 0)
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteArticle(deleteId)
    setDeleteId(null)
    loadData()
  }

  const handleToggleStatus = async (id: number, status: number) => {
    await updateArticleStatus(id, status === 1 ? 0 : 1)
    loadData()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={() => navigate('/admin/articles/edit')}>
          新增文章
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-5">
          <div className="flex gap-2 mb-4">
            <Input placeholder="搜索标题..." value={keyword} onValueChange={setKeyword} className="w-64" endContent={<Search className="w-4 h-4 text-gray-400" />} />
            <Button color="primary" onPress={() => { setPage(1); loadData() }}>查询</Button>
          </div>

          <Table aria-label="文章列表">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>标题</TableColumn>
              <TableColumn>分类</TableColumn>
              <TableColumn>状态</TableColumn>
              <TableColumn>浏览量</TableColumn>
              <TableColumn>创建时间</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody items={data}>
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.category?.name}</TableCell>
                  <TableCell>
                    <Chip size="sm" color={item.status === 1 ? 'success' : 'default'} variant="flat">
                      {item.status === 1 ? '发布' : '草稿'}
                    </Chip>
                  </TableCell>
                  <TableCell>{item.viewCount}</TableCell>
                  <TableCell>{new Date(item.createdTime).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button isIconOnly size="sm" variant="light" onPress={() => handleToggleStatus(item.id, item.status)}>
                        <Icon icon="mdi:eye" className="text-lg text-gray-500" />
                      </Button>
                      <Button isIconOnly size="sm" variant="light" onPress={() => navigate(`/admin/articles/edit/${item.id}`)}>
                        <Pencil className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => setDeleteId(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {total > pageSize && (
            <div className="flex justify-end mt-4">
              <Pagination total={Math.ceil(total / pageSize)} page={page} onChange={setPage} color="primary" />
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <ModalContent>
          <ModalHeader>确认删除</ModalHeader>
          <ModalBody>确定要删除这篇文章吗？删除后可在前台隐藏。</ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setDeleteId(null)}>取消</Button>
            <Button color="danger" onPress={handleDelete}>删除</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
