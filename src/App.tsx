import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Header } from './components/header'
import { SummaryBar } from './components/summary-bar'
import { MemberColumn } from './components/member-column'

export default function App() {
  const { members, loading, subscribe, unsubscribe, seedData } = useStore()

  useEffect(() => {
    subscribe()
    return () => unsubscribe()
  }, [subscribe, unsubscribe])

  useEffect(() => {
    seedData()
  }, [seedData])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 py-6">
        <SummaryBar />
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:overflow-x-auto sm:pb-4">
          {members.map((member, index) => (
            <MemberColumn key={member.id} memberId={member.id} index={index} />
          ))}
        </div>
      </main>
    </div>
  )
}
