import { useEffect, useState } from 'react'
import { Card, CardBody, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { getLinkPage, addLink, updateLink, deleteLink } from '@/api/link'

export default function LinkManagePage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [form, setForm] = useState({ id: 0, name: '', url: '', description: '', icon: '', sortOrder: 0 })
  const pageSize = 10

  useEffect(() => { loadData() }, [page])

  const loadData = () => {
    getLinkPage({ pageNum: page, pageSize, keyword }).then((res: any) => {
      setData(res.data?.list || [])
      setTotal(res.data?.total || 0)
    })
  }

  const handleSave = async () => {
    if (isEdit) await updateLink(form)
    else await addLink(form)
    setModalOpen(false)
    loadData()
  }

  const handleDelete = async (id: number) => {
    await deleteLink(id)
    loadData()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">友情链接</h1>
        <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={() => { setIsEdit(false); setForm({ id: 0, name: '', url: '', description: '', icon: '', sortOrder: 0 }); setModalOpen(true) }}>新增链接</Button>
      </div>
      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-5">
          <div className="flex gap-2 mb-4">
            <Input placeholder="搜索..." value={keyword} onValueChange={setKeyword} className="w-64" endContent={<Search className="w-4 h-4 text-gray-400" />} />
            <Button color="primary" onPress={() => { setPage(1); loadData() }}>查询</Button>
          </div>
          <Table aria-label="链接列表">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>名称</TableColumn>
              <TableColumn>URL</TableColumn>
              <TableColumn>描述</TableColumn>
              <TableColumn>排序</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody items={data}>
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-blue-500">{item.url}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button isIconOnly size="sm" variant="light" onPress={() => { setIsEdit(true); setForm({ ...item }); setModalOpen(true) }}><Pencil className="w-4 h-4 text-blue-500" /></Button>
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
          <ModalHeader>{isEdit ? '编辑链接' : '新增链接'}</ModalHeader>
          <ModalBody className="space-y-3">
            <Input label="名称" value={form.name} onValueChange={(v) => setForm({ ...form, name: v })} />
            <Input label="URL" value={form.url} onValueChange={(v) => setForm({ ...form, url: v })} />
            <Input label="描述" value={form.description} onValueChange={(v) => setForm({ ...form, description: v })} />
            <Input label="图标URL" value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })} />
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
