import { useEffect, useState } from 'react'
import { Card, CardBody, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { Icon } from '@iconify/react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { getCategoryPage, addCategory, updateCategory, deleteCategory } from '@/api/category'

export default function CategoryManagePage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [form, setForm] = useState({ id: 0, name: '', description: '', sortOrder: 0 })
  const pageSize = 10

  useEffect(() => { loadData() }, [page])

  const loadData = () => {
    getCategoryPage({ pageNum: page, pageSize, keyword }).then((res: any) => {
      setData(res.data?.list || [])
      setTotal(res.data?.total || 0)
    })
  }

  const handleSave = async () => {
    if (isEdit) {
      await updateCategory(form)
    } else {
      await addCategory(form)
    }
    setModalOpen(false)
    loadData()
  }

  const handleDelete = async (id: number) => {
    await deleteCategory(id)
    loadData()
  }

  const openAdd = () => {
    setIsEdit(false)
    setForm({ id: 0, name: '', description: '', sortOrder: 0 })
    setModalOpen(true)
  }

  const openEdit = (row: any) => {
    setIsEdit(true)
    setForm({ id: row.id, name: row.name, description: row.description || '', sortOrder: row.sortOrder })
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={openAdd}>新增分类</Button>
      </div>
      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-5">
          <div className="flex gap-2 mb-4">
            <Input placeholder="搜索..." value={keyword} onValueChange={setKeyword} className="w-64" endContent={<Search className="w-4 h-4 text-gray-400" />} />
            <Button color="primary" onPress={() => { setPage(1); loadData() }}>查询</Button>
          </div>
          <Table aria-label="分类列表">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>名称</TableColumn>
              <TableColumn>描述</TableColumn>
              <TableColumn>排序</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody items={data}>
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button isIconOnly size="sm" variant="light" onPress={() => openEdit(item)}><Pencil className="w-4 h-4 text-blue-500" /></Button>
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {total > pageSize && <div className="flex justify-end mt-4"><Pagination total={Math.ceil(total / pageSize)} page={page} onChange={setPage} color="primary" /></div>}
        </CardBody>
      </Card>
      <Modal isOpen={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>{isEdit ? '编辑分类' : '新增分类'}</ModalHeader>
          <ModalBody className="space-y-3">
            <Input label="名称" value={form.name} onValueChange={(v) => setForm({ ...form, name: v })} />
            <Input label="描述" value={form.description} onValueChange={(v) => setForm({ ...form, description: v })} />
            <Input label="排序" type="number" value={String(form.sortOrder)} onValueChange={(v) => setForm({ ...form, sortOrder: Number(v) })} />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setModalOpen(false)}>取消</Button>
            <Button color="primary" onPress={handleSave}>确认</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
