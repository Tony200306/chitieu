import { useState } from 'react'
import { Plus, Pencil, X } from 'lucide-react'
import { Button } from './ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { MemberRow } from './member-row'
import { useStore } from '@/lib/store'
import { PRESET_COLORS, type ExpenseItem } from '@/lib/types'
import { cn, formatAmount } from '@/lib/utils'

interface MemberColumnProps {
  memberId: string
  index: number
}

export function MemberColumn({ memberId, index }: MemberColumnProps) {
  const { members, getMemberExpenses, addExpense, updateExpense, deleteExpense, renameMember, removeMember } = useStore()
  const member = members.find((m) => m.id === memberId)!
  const items = getMemberExpenses(memberId)
  const memberTotal = items.reduce((s, e) => s + e.amount, 0)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(member.name)
  const [removeOpen, setRemoveOpen] = useState(false)

  const colorClass = PRESET_COLORS[index % PRESET_COLORS.length]

  const handleAddRow = () => {
    addExpense({
      memberId,
      amount: 0,
      info: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    })
  }

  const handleUpdate = (itemId: string, data: Partial<ExpenseItem>) => {
    updateExpense(itemId, data)
  }

  const handleDelete = (itemId: string) => {
    deleteExpense(itemId)
  }

  const handleRename = () => {
    if (nameInput.trim() && nameInput.trim() !== member.name) {
      renameMember(memberId, nameInput.trim())
    } else {
      setNameInput(member.name)
    }
    setEditingName(false)
  }

  return (
    <div className="flex w-full flex-col rounded-xl border bg-card shadow-sm transition-all hover:shadow-md sm:w-64 sm:shrink-0">
      <div className={cn('flex items-center gap-2 rounded-t-xl px-3 py-2.5', colorClass)}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
          {index + 1}
        </div>

        {editingName ? (
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') {
                setNameInput(member.name)
                setEditingName(false)
              }
            }}
            className="min-w-0 flex-1 rounded bg-white/20 px-1.5 py-0.5 text-sm font-medium text-white outline-none placeholder:text-white/60"
            autoFocus
          />
        ) : (
          <span
            className="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium text-white"
            onDoubleClick={() => { setNameInput(member.name); setEditingName(true) }}
            title="Nhấp đôi để đổi tên"
          >
            {member.name}
          </span>
        )}

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setEditingName(true)}
            className="flex h-5 w-5 items-center justify-center rounded text-white/70 hover:bg-white/20 hover:text-white"
          >
            <Pencil className="h-3 w-3" />
          </button>
          {members.length > 1 && (
            <button
              onClick={() => setRemoveOpen(true)}
              className="flex h-5 w-5 items-center justify-center rounded text-white/50 hover:bg-white/20 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá {member.name}?</DialogTitle>
            <DialogDescription>
              Sẽ xoá vĩnh viễn tất cả chi tiêu của người này. Không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={() => { removeMember(memberId); setRemoveOpen(false) }}>
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-1.5 p-2.5">
        {items.map((item) => (
          <MemberRow
            key={item.id}
            item={item}
            onUpdate={(data) => handleUpdate(item.id, data)}
            onDelete={() => handleDelete(item.id)}
          />
        ))}

        <button
          onClick={handleAddRow}
          className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border/60 py-2 text-xs text-muted-foreground/60 transition-colors hover:border-border hover:text-muted-foreground"
        >
          <Plus className="h-3 w-3" />
          Thêm dòng
        </button>
      </div>

      <div className="border-t border-border/50 px-3 py-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tổng</span>
          <span className="font-semibold">{formatAmount(memberTotal)}</span>
        </div>
      </div>
    </div>
  )
}
