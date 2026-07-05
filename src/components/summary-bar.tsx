import { useStore } from '@/lib/store'
import { PRESET_COLORS } from '@/lib/types'
import { cn, formatAmount } from '@/lib/utils'
import { Wallet } from 'lucide-react'

export function SummaryBar() {
  const { members, expenses, getTotalSpent, getSharePerPerson, getBalance, getSettlements } = useStore()
  const total = getTotalSpent()
  const share = getSharePerPerson()
  const settlements = getSettlements()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap">
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Tổng chi</p>
            <p className="text-lg font-bold">{formatAmount(total)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <span className="text-xs font-bold text-muted-foreground">{formatAmount(total / members.length || 0)}</span>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Mỗi người</p>
            <p className="text-lg font-bold">{formatAmount(share)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <span className="text-xs font-bold text-muted-foreground">{expenses.length}</span>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Khoản chi</p>
            <p className="text-lg font-bold">{expenses.length}</p>
          </div>
        </div>

        {members.map((m, i) => {
          const bal = getBalance(m.id)
          const colorClass = PRESET_COLORS[i % PRESET_COLORS.length]
          return (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', colorClass)}>
                <span className="text-xs font-bold text-white">{m.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{m.name}</p>
                <p className={cn('text-sm font-semibold', bal > 1 ? 'text-emerald-600 dark:text-emerald-400' : bal < -1 ? 'text-red-600 dark:text-red-400' : 'text-foreground')}>
                  {bal > 1 ? '+' : bal < -1 ? '-' : ''}{formatAmount(Math.abs(bal))}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {settlements.length > 0 && (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-4 py-2 border-b border-border/50">
            <p className="text-xs font-medium text-muted-foreground">Thanh toán</p>
          </div>
          <div className="divide-y divide-border/50">
            {settlements.map((s, i) => {
              const from = members.find((m) => m.id === s.from)
              const to = members.find((m) => m.id === s.to)
              const fromIdx = members.findIndex((m) => m.id === s.from)
              const toIdx = members.findIndex((m) => m.id === s.to)
              if (!from || !to) return null
              return (
                <div key={i} className="flex items-center gap-2 px-4 py-2 text-xs animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className={cn('inline-flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold text-white', PRESET_COLORS[fromIdx % PRESET_COLORS.length])}>{from.name.charAt(0)}</span>
                  <span className="font-medium text-red-600 dark:text-red-400">trả</span>
                  <span className={cn('inline-flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold text-white', PRESET_COLORS[toIdx % PRESET_COLORS.length])}>{to.name.charAt(0)}</span>
                  <span className="font-semibold">{formatAmount(s.amount)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {expenses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">Chưa có khoản chi nào</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Thêm dòng vào cột mỗi người để bắt đầu</p>
        </div>
      )}
    </div>
  )
}
