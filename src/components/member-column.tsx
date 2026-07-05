import { useState, useRef } from 'react'
import { Plus, Pencil, X, Phone, QrCode, Trash2 } from 'lucide-react'
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
  const { members, getMemberExpenses, addExpense, updateExpense, deleteExpense, renameMember, updateMemberPhone, uploadMemberQr, removeMember, clearMemberExpenses } = useStore()
  const member = members.find((m) => m.id === memberId)!
  const items = getMemberExpenses(memberId)
  const memberTotal = items.reduce((s, e) => s + e.amount, 0)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(member.name)
  const [editingPhone, setEditingPhone] = useState(false)
  const [phoneInput, setPhoneInput] = useState(member.phone || '')
  const [removeOpen, setRemoveOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [qrViewOpen, setQrViewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handlePhoneCommit = () => {
    updateMemberPhone(memberId, phoneInput.trim())
    setEditingPhone(false)
  }

  const handleFilePick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadMemberQr(memberId, file)
  }

  return (
    <div className="flex w-full flex-col rounded-xl border bg-card shadow-sm transition-all hover:shadow-md sm:w-96 sm:shrink-0">
      <div className={cn('rounded-t-xl px-3 py-2.5', colorClass)}>
        <div className="flex items-center gap-2">
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
                if (e.key === 'Escape') { setNameInput(member.name); setEditingName(false) }
              }}
              className="min-w-0 flex-1 rounded bg-white/20 px-1.5 py-0.5 text-sm font-medium text-white outline-none"
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
            <button onClick={() => setEditingName(true)} className="flex h-5 w-5 items-center justify-center rounded text-white/70 hover:bg-white/20 hover:text-white">
              <Pencil className="h-3 w-3" />
            </button>
            {members.length > 1 && (
              <button onClick={() => setRemoveOpen(true)} className="flex h-5 w-5 items-center justify-center rounded text-white/50 hover:bg-white/20 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-1.5 rounded bg-white/10 px-2 py-1 text-[11px] text-white/80">
            <Phone className="h-3 w-3 shrink-0" />
            {editingPhone ? (
              <input
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                onBlur={handlePhoneCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePhoneCommit()
                  if (e.key === 'Escape') { setPhoneInput(member.phone || ''); setEditingPhone(false) }
                }}
                placeholder="SĐT"
                className="min-w-0 flex-1 bg-transparent outline-none text-white placeholder:text-white/40"
                autoFocus
              />
            ) : (
              <span
                className="min-w-0 flex-1 cursor-pointer truncate"
                onClick={() => { setPhoneInput(member.phone || ''); setEditingPhone(true) }}
              >
                {member.phone || 'Thêm SĐT'}
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center">
          <div className="relative group cursor-pointer" onClick={() => member.qrUrl && setQrViewOpen(true)}>
            {member.qrUrl ? (
              <img
                src={member.qrUrl}
                alt={`QR ${member.name}`}
                className="h-48 w-48 rounded-lg border-2 border-white/20 object-contain bg-white transition-transform hover:scale-[1.02]"
              />
            ) : (
              <div
                onClick={(e) => { e.stopPropagation(); handleFilePick() }}
                className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 text-white/40 transition-colors hover:border-white/40 hover:text-white/60"
              >
                <div className="flex flex-col items-center gap-2">
                  <QrCode className="h-8 w-8" />
                  <span className="text-xs">Thêm QR</span>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {member.qrUrl && (
          <button
            onClick={handleFilePick}
            className="mt-1 w-full flex items-center justify-center gap-1 rounded bg-white/10 py-1 text-[10px] text-white/60 hover:bg-white/20 hover:text-white/80 transition-colors"
          >
            <QrCode className="h-3 w-3" />
            Đổi ảnh QR
          </button>
        )}
      </div>

      <Dialog open={qrViewOpen} onOpenChange={setQrViewOpen}>
        <DialogContent className="max-w-lg">
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm font-medium">{member.name}</p>
            {member.qrUrl && (
              <img src={member.qrUrl} alt={`QR ${member.name}`} className="w-full max-w-[500px] rounded-lg object-contain bg-white" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá {member.name}?</DialogTitle>
            <DialogDescription>Sẽ xoá vĩnh viễn tất cả chi tiêu của người này. Không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={() => { removeMember(memberId); setRemoveOpen(false) }}>Xoá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá chi tiêu của {member.name}?</DialogTitle>
            <DialogDescription>Chỉ xoá các khoản chi, không xoá người này. Không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={() => { clearMemberExpenses(memberId); setClearOpen(false) }}>Xoá chi tiêu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-1.5 p-2.5">
        {items.map((item) => (
          <MemberRow key={item.id} item={item} onUpdate={(data) => handleUpdate(item.id, data)} onDelete={() => handleDelete(item.id)} />
        ))}
        <button onClick={handleAddRow} className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border/60 py-2 text-xs text-muted-foreground/60 transition-colors hover:border-border hover:text-muted-foreground">
          <Plus className="h-3 w-3" />
          Thêm dòng
        </button>
      </div>

      <div className="border-t border-border/50 px-3 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setClearOpen(true)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-destructive transition-colors"
            title="Xoá toàn bộ chi tiêu"
          >
            <Trash2 className="h-3 w-3" />
            Xoá dữ liệu
          </button>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">Tổng</span>
            <span className="font-semibold">{formatAmount(memberTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
