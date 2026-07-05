import { create } from 'zustand'
import { db } from './firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import type { Member, ExpenseItem, Settlement } from './types'

interface AppState {
  members: Member[]
  expenses: ExpenseItem[]
  loading: boolean
  unsubscribeMembers: Unsubscribe | null
  unsubscribeExpenses: Unsubscribe | null

  subscribe: () => void
  unsubscribe: () => void

  addMember: (name: string) => Promise<void>
  removeMember: (id: string) => Promise<void>
  renameMember: (id: string, name: string) => Promise<void>
  updateMemberPhone: (id: string, phone: string) => Promise<void>
  uploadMemberQr: (id: string, file: File) => Promise<void>

  addExpense: (item: Omit<ExpenseItem, 'id'>) => Promise<void>
  updateExpense: (id: string, data: Partial<ExpenseItem>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>

  clearAll: () => Promise<void>
  clearMemberExpenses: (memberId: string) => Promise<void>
  seedData: () => Promise<void>

  getMemberTotal: (memberId: string) => number
  getTotalSpent: () => number
  getSharePerPerson: () => number
  getBalance: (memberId: string) => number
  getSettlements: () => Settlement[]
  getMemberExpenses: (memberId: string) => ExpenseItem[]
}

export const useStore = create<AppState>()((set, get) => ({
  members: [],
  expenses: [],
  loading: true,
  unsubscribeMembers: null,
  unsubscribeExpenses: null,

  subscribe: () => {
    const unsubMembers = onSnapshot(
      query(collection(db, 'members'), orderBy('createdAt')),
      (snap) => {
        const members = snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            name: data.name as string,
            phone: data.phone as string | undefined,
            qrUrl: data.qrUrl as string | undefined,
            qrData: data.qrData as string | undefined,
          }
        })
        set({ members })
      }
    )

    const unsubExpenses = onSnapshot(
      query(collection(db, 'expenses'), orderBy('createdAt')),
      (snap) => {
        const expenses = snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            memberId: data.memberId as string,
            amount: data.amount as number,
            info: data.info as string,
            category: data.category as string,
            date: data.date as string,
          }
        })
        set({ expenses, loading: false })
      },
      () => set({ loading: false })
    )

    set({ unsubscribeMembers: unsubMembers, unsubscribeExpenses: unsubExpenses })
  },

  unsubscribe: () => {
    get().unsubscribeMembers?.()
    get().unsubscribeExpenses?.()
  },

  addMember: async (name) => {
    await addDoc(collection(db, 'members'), { name, createdAt: serverTimestamp() })
  },

  removeMember: async (id) => {
    const batch = writeBatch(db)
    get().expenses.filter((e) => e.memberId === id).forEach((e) => {
      batch.delete(doc(db, 'expenses', e.id))
    })
    batch.delete(doc(db, 'members', id))
    await batch.commit()
  },

  renameMember: async (id, name) => {
    await updateDoc(doc(db, 'members', id), { name })
  },

  updateMemberPhone: async (id, phone) => {
    await updateDoc(doc(db, 'members', id), { phone })
  },

  uploadMemberQr: async (id, file) => {
    const qrData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    await updateDoc(doc(db, 'members', id), { qrData })
  },

  addExpense: async (item) => {
    await addDoc(collection(db, 'expenses'), {
      ...item,
      createdAt: serverTimestamp(),
    })
  },

  updateExpense: async (id, data) => {
    await updateDoc(doc(db, 'expenses', id), data)
  },

  deleteExpense: async (id) => {
    await deleteDoc(doc(db, 'expenses', id))
  },

  clearAll: async () => {
    const batch = writeBatch(db)
    get().expenses.forEach((e) => { batch.delete(doc(db, 'expenses', e.id)) })
    get().members.forEach((m) => { batch.delete(doc(db, 'members', m.id)) })
    await batch.commit()
  },

  clearMemberExpenses: async (memberId) => {
    const batch = writeBatch(db)
    get().expenses.filter((e) => e.memberId === memberId).forEach((e) => {
      batch.delete(doc(db, 'expenses', e.id))
    })
    await batch.commit()
  },

  seedData: async () => {
    const snap = await getDocs(query(collection(db, 'members')))
    if (!snap.empty) return

    const refs = await Promise.all([
      addDoc(collection(db, 'members'), { name: 'Member 1', createdAt: serverTimestamp() }),
      addDoc(collection(db, 'members'), { name: 'Member 2', createdAt: serverTimestamp() }),
      addDoc(collection(db, 'members'), { name: 'Member 3', createdAt: serverTimestamp() }),
    ])

    const seed = [
      { mi: 0, amount: 450000, info: 'Tiền điện tháng 6', category: 'Utilities', date: '2026-06-05' },
      { mi: 0, amount: 320000, info: 'Đi chợ cuối tuần', category: 'Food', date: '2026-06-08' },
      { mi: 0, amount: 200000, info: 'Nước rửa chén, giấy vệ sinh', category: 'Household', date: '2026-06-10' },
      { mi: 0, amount: 150000, info: 'Grab đi làm cả tuần', category: 'Transport', date: '2026-06-12' },
      { mi: 1, amount: 3000000, info: 'Tiền nhà tháng 6', category: 'Rent', date: '2026-06-01' },
      { mi: 1, amount: 280000, info: 'Ăn tối cùng cả nhà', category: 'Food', date: '2026-06-07' },
      { mi: 1, amount: 120000, info: 'Mua trái cây', category: 'Food', date: '2026-06-09' },
      { mi: 2, amount: 180000, info: 'Tiền nước tháng 6', category: 'Utilities', date: '2026-06-06' },
      { mi: 2, amount: 350000, info: 'Đổ xăng cả tháng', category: 'Transport', date: '2026-06-11' },
      { mi: 2, amount: 250000, info: 'Ăn sáng cùng mọi người', category: 'Food', date: '2026-06-13' },
    ]

    const batch = writeBatch(db)
    seed.forEach((s) => {
      const ref = doc(collection(db, 'expenses'))
      batch.set(ref, {
        memberId: refs[s.mi].id,
        amount: s.amount,
        info: s.info,
        category: s.category,
        date: s.date,
        createdAt: serverTimestamp(),
      })
    })
    await batch.commit()
  },

  getMemberTotal: (memberId) =>
    get().expenses.filter((e) => e.memberId === memberId).reduce((s, e) => s + e.amount, 0),

  getTotalSpent: () =>
    get().expenses.reduce((s, e) => s + e.amount, 0),

  getSharePerPerson: () => {
    const total = get().getTotalSpent()
    return total / (get().members.length || 1)
  },

  getBalance: (memberId) => get().getMemberTotal(memberId) - get().getSharePerPerson(),

  getSettlements: () => {
    const balances = get().members.map((m) => ({
      memberId: m.id,
      balance: get().getBalance(m.id),
    }))

    const debtors = balances.filter((b) => b.balance < -1).map((b) => ({ ...b, balance: Math.abs(b.balance) }))
    const creditors = balances.filter((b) => b.balance > 1).map((b) => ({ ...b, balance: b.balance }))

    const settlements: Settlement[] = []
    let i = 0; let j = 0
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].balance, creditors[j].balance)
      settlements.push({ from: debtors[i].memberId, to: creditors[j].memberId, amount: Math.round(amount) })
      debtors[i].balance -= amount
      creditors[j].balance -= amount
      if (debtors[i].balance < 1) i++
      if (creditors[j].balance < 1) j++
    }
    return settlements
  },

  getMemberExpenses: (memberId) => get().expenses.filter((e) => e.memberId === memberId),
}))
