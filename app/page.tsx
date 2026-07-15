import { ScheduleDashboard } from '@/components/ScheduleDashboard'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <ScheduleDashboard />
      </main>
      <SiteFooter />
    </div>
  )
}
