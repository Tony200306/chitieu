import { Plus, Download, Upload, Trash2, Users } from 'lucide-react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'
import { Separator } from './ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog'
import { useStore } from '@/lib/store'
import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'

export function Header() {
  const { members, expenses, addMember, clearAll } = useStore()
  const [clearOpen, setClearOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')

  const exportCSV = () => {
    const rows = expenses.map((e) => {
      const m = members.find((m) => m.id === e.memberId)
      return `"${m?.name || '?'}","${e.info}",${e.amount},"${e.category}","${e.date}"`
    })
    const csv = ['Thành viên,Nội dung,Số tiền,Danh mục,Ngày', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importCSV = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const lines = text.split('\n').slice(1).filter(Boolean)
      lines.forEach((line) => {
        const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
        const memberName = cols[0]
        let member = members.find((m) => m.name === memberName)
        if (!member) {
          const id = crypto.randomUUID()
          member = { id, name: memberName }
          addMember(memberName)
        }
        useStore.getState().addExpense({
          memberId: member.id,
          amount: parseFloat(cols[2]) || 0,
          info: cols[1] || '',
          category: cols[3] || '',
          date: cols[4] || new Date().toISOString().split('T')[0],
        })
      })
    }
    input.click()
  }

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      addMember(newMemberName.trim())
      setNewMemberName('')
      setAddOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-1 px-3 sm:px-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary sm:h-8 sm:w-8">
            <Users className="h-3.5 w-3.5 text-primary-foreground sm:h-4 sm:w-4" />
          </div>
          <span className="text-xs font-semibold sm:text-sm">SplitWise</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-lg px-2 sm:px-3">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-1">Thêm thành viên</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm thành viên</DialogTitle>
                <DialogDescription>Nhập tên người mới.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên</Label>
                  <Input
                    id="name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="VD: An"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddMember()
                    }}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddMember} disabled={!newMemberName.trim()}>
                    Thêm
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Separator orientation="vertical" className="h-4 sm:h-6" />

          <Button variant="ghost" size="icon" onClick={exportCSV} className="hidden sm:inline-flex rounded-full" title="Xuất CSV">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={importCSV} className="hidden sm:inline-flex rounded-full" title="Nhập CSV">
            <Upload className="h-4 w-4" />
          </Button>

          <Dialog open={clearOpen} onOpenChange={setClearOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-destructive hover:text-destructive" title="Xoá tất cả">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xoá tất cả?</DialogTitle>
                <DialogDescription>
                  Sẽ xoá vĩnh viễn tất cả chi tiêu và thành viên. Không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setClearOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      clearAll()
                      setClearOpen(false)
                    }}
                  >
                    Xoá hết
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Separator orientation="vertical" className="h-6" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
