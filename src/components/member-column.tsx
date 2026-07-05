import { useState, useRef } from 'react'
import { Plus, Pencil, X, Phone, QrCode, Eye } from 'lucide-react'
import { Button } from './ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { MemberRow } from './member-row'
import { useStore } from '@/lib/store'
import { PRESET_COLORS, type ExpenseItem } from '@/lib/types'
import { cn, formatAmount } from '@/lib/utils'
import { QrViewer } from './qr-viewer'

interface MemberColumnProps {
  memberId: string
  index: number
}

export function MemberColumn({ memberId, index }: MemberColumnProps) {
  const { members, getMemberExpenses, addExpense, updateExpense, deleteExpense, renameMember, updateMemberPhone, uploadMemberQr, removeMember } = useStore()
  const member = members.find((m) => m.id === memberId)!
  const items = getMemberExpenses(memberId)
  const memberTotal = items.reduce((s, e) => s + e.amount, 0)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(member.name)
  const [editingPhone, setEditingPhone] = useState(false)
  const [phoneInput, setPhoneInput] = useState(member.phone || '')
  const [removeOpen, setRemoveOpen] = useState(false)
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
    <div className="flex w-full flex-col rounded-xl border bg-card shadow-sm transition-all hover:shadow-md sm:w-64 sm:shrink-0">
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

          <button
            onClick={handleFilePick}
            className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            title="Tải ảnh QR"
          >
            <QrCode className="h-3.5 w-3.5" />
          </button>
          {member.qrUrl && (
            <button
              onClick={() => setQrViewOpen(true)}
              className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              title="Xem QR"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {member.qrUrl && (
        <QrViewer url={member.qrUrl} name={member.name} open={qrViewOpen} onClose={() => setQrViewOpen(false)} />
      )}

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
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tổng</span>
          <span className="font-semibold">{formatAmount(memberTotal)}</span>
        </div>
      </div>
    </div>
  )
}
