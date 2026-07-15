'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Trash2, Sparkles, Database } from 'lucide-react'
import { CourseSelector } from '@/components/CourseSelector'
import { Timetable } from '@/components/Timetable'
import { AutoGenerateModal } from '@/components/AutoGenerateModal'
import { useScheduleStore } from '@/store/useScheduleStore'

/**
 * Client dashboard shell. Waits for the Zustand persist rehydration flag
 * before rendering schedule-dependent UI to avoid SSR/localStorage
 * hydration mismatches.
 */
export function ScheduleDashboard() {
  const courses = useScheduleStore((s) => s.courses)
  const existingClasses = useScheduleStore((s) => s.existingClasses)
  const clearSchedule = useScheduleStore((s) => s.clearSchedule)
  const seedDemoData = useScheduleStore((s) => s.seedDemoData)

  // localStorage rehydration is synchronous, so once this component has
  // mounted on the client the persisted schedule is already in the store.
  // Gating on `mounted` avoids SSR/client hydration mismatches.
  const [mounted, setMounted] = useState(false)
  const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const hasHydrated = mounted

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-foreground">Your Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {hasHydrated
              ? `${courses.length} ${courses.length === 1 ? 'course' : 'courses'} in catalog · ${existingClasses.length} ${existingClasses.length === 1 ? 'class' : 'classes'} scheduled`
              : 'Loading your schedule...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {courses.length === 0 && (
            <button
              type="button"
              onClick={seedDemoData}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Database aria-hidden="true" className="size-4" />
              Load Demo Data
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAutoGenerateOpen(true)}
            disabled={!hasHydrated || courses.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles aria-hidden="true" className="size-4" />
            Auto-Generate
          </button>
          <button
            type="button"
            onClick={clearSchedule}
            disabled={!hasHydrated || existingClasses.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Clear schedule
          </button>
        </div>
      </div>

      {hasHydrated ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <CourseSelector />
          <Timetable />
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground"
        >
          Restoring saved schedule...
        </div>
      )}

      <AutoGenerateModal 
        open={isAutoGenerateOpen} 
        onClose={() => setIsAutoGenerateOpen(false)} 
      />
    </div>
  )
}
