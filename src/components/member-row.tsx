import { useState, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import type { ExpenseItem } from '@/lib/types'

interface MemberRowProps {
  item: ExpenseItem
  onUpdate: (data: Partial<ExpenseItem>) => void
  onDelete: () => void
  autoFocus?: boolean
}

export function MemberRow({ item, onUpdate, onDelete, autoFocus }: MemberRowProps) {
  const [displayVal, setDisplayVal] = useState(item.amount ? (item.amount / 1000).toString() : '')
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && amountRef.current) amountRef.current.focus()
  }, [autoFocus])

  useEffect(() => {
    const inK = item.amount / 1000
    setDisplayVal(inK ? inK.toString() : '')
  }, [item.amount])

  const commitAmount = (val: string) => {
    const num = parseFloat(val)
    if (!isNaN(num) && num > 0) onUpdate({ amount: Math.round(num * 1000) })
  }

  return (
    <div className="group relative rounded-lg border border-border/50 bg-card/50 transition-all hover:border-border hover:bg-card hover:shadow-sm">
      <div className="flex items-stretch">
        <div className="flex w-24 shrink-0 items-center border-r border-border/50 px-2">
          <input
            ref={amountRef}
            type="number"
            step="1"
            min="0"
            value={displayVal}
            onChange={(e) => setDisplayVal(e.target.value)}
            onBlur={() => commitAmount(displayVal)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { commitAmount(displayVal); (e.target as HTMLInputElement).blur() }
            }}
            placeholder="0"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-[10px] text-muted-foreground shrink-0">k</span>
        </div>

        <input
          type="text"
          value={item.info}
          onChange={(e) => onUpdate({ info: e.target.value })}
          placeholder="Nội dung?"
          className="min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-xs outline-none placeholder:text-muted-foreground/40"
        />
      </div>

      <button
        onClick={onDelete}
        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-all hover:scale-110 group-hover:opacity-100"
      >
        <Trash2 className="h-2.5 w-2.5" />
      </button>
    </div>
  )
}
