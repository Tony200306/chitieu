export interface Member {
  id: string
  name: string
  phone?: string
  qrUrl?: string
  qrData?: string
}

export interface ExpenseItem {
  id: string
  memberId: string
  amount: number
  info: string
  category: string
  date: string
}

export interface Settlement {
  from: string
  to: string
  amount: number
}

export const PRESET_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-rose-500',
  'bg-violet-500', 'bg-amber-500', 'bg-cyan-500',
  'bg-pink-500', 'bg-lime-500', 'bg-orange-500',
]
