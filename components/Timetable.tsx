'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { Download, X, ArrowRightLeft } from 'lucide-react'
import { toPng, toJpeg } from 'html-to-image'
import { formatTime } from '@/lib/conflictCheck'
import { useScheduleStore } from '@/store/useScheduleStore'
import { cn } from '@/lib/utils'

/** Calendar window: 8:00 AM to 8:00 PM in 30-minute blocks. */
const DAY_START = 8 * 60 // 480
const DAY_END = 20 * 60 // 1200
const SLOT_MINUTES = 30
const TOTAL_TIME_BLOCKS = (DAY_END - DAY_START) / SLOT_MINUTES // 24

const WEEKDAYS = [
  { day: 1, label: 'Monday', short: 'Mon' },
  { day: 2, label: 'Tuesday', short: 'Tue' },
  { day: 3, label: 'Wednesday', short: 'Wed' },
  { day: 4, label: 'Thursday', short: 'Thu' },
  { day: 5, label: 'Friday', short: 'Fri' },
  { day: 6, label: 'Saturday', short: 'Sat' },
  { day: 7, label: 'Sunday', short: 'Sun' },
]

/** Distinct block colors cycled per class */
const BLOCK_COLORS = [
  'bg-chart-1 text-primary-foreground',
  'bg-chart-2 text-primary-foreground',
  'bg-chart-3 text-primary-foreground',
  'bg-chart-4 text-primary-foreground',
  'bg-chart-5 text-primary-foreground',
]

/** Converts minutes-from-midnight to a 1-based grid index (accounting for header row/col). */
function minutesToGridIndex(minutes: number): number {
  const clamped = Math.min(Math.max(minutes, DAY_START), DAY_END)
  return (clamped - DAY_START) / SLOT_MINUTES + 2
}

type LayoutMode = 'vertical' | 'horizontal'

export function Timetable() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [layout, setLayout] = useState<LayoutMode>('vertical')

  const [nowMinutes, setNowMinutes] = useState(
    () => new Date().getHours() * 60 + new Date().getMinutes()
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMinutes(new Date().getHours() * 60 + new Date().getMinutes())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const existingClasses = useScheduleStore((s) => s.existingClasses)
  const removeClass = useScheduleStore((s) => s.removeClass)

  const handleExport = useCallback(
    async (format: 'png' | 'jpeg') => {
      if (!gridRef.current) return
      setExporting(true)
      setShowExportMenu(false)
      try {
        const fn = format === 'png' ? toPng : toJpeg
        const dataUrl = await fn(gridRef.current, {
          quality: 0.95,
          backgroundColor: '#ffffff',
          pixelRatio: 2,
        })
        const date = new Date().toISOString().split('T')[0]
        const link = document.createElement('a')
        link.download = `schedule-${date}.${format}`
        link.href = dataUrl
        link.click()
      } catch (err) {
        console.error('Export failed:', err)
      } finally {
        setExporting(false)
      }
    },
    [],
  )

  const toggleLayout = () => {
    setLayout((prev) => (prev === 'vertical' ? 'horizontal' : 'vertical'))
  }

  // Calculate grid template based on layout
  const gridTemplateColumns =
    layout === 'vertical'
      ? `4rem repeat(7, minmax(0, 1fr))` // time column + 7 days
      : `5rem repeat(${TOTAL_TIME_BLOCKS}, minmax(3rem, 1fr))` // days column + 24 time blocks

  const gridTemplateRows =
    layout === 'vertical'
      ? `2.5rem repeat(${TOTAL_TIME_BLOCKS}, 2rem)` // header + 24 time blocks
      : `2.5rem repeat(7, minmax(4rem, 1fr))` // header + 7 days

  const nowGridIndex = minutesToGridIndex(nowMinutes)

  return (
    <section aria-label="Weekly timetable" className="flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={toggleLayout}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <ArrowRightLeft aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">
            {layout === 'vertical' ? 'Switch to Horizontal' : 'Switch to Vertical'}
          </span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu((p) => !p)}
            disabled={exporting || existingClasses.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download aria-hidden="true" className="size-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg animate-fade-in">
              <button
                type="button"
                onClick={() => handleExport('png')}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-card-foreground transition-colors hover:bg-accent"
              >
                Export as PNG
              </button>
              <button
                type="button"
                onClick={() => handleExport('jpeg')}
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-sm text-card-foreground transition-colors hover:bg-accent"
              >
                Export as JPEG
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timetable grid (captured by export) */}
      <div
        ref={gridRef}
        className="relative overflow-x-auto rounded-lg border border-border bg-card backdrop-blur-lg"
      >
        <div
          className={cn('grid', layout === 'horizontal' ? 'min-w-[1200px]' : 'min-w-[640px]')}
          style={{ gridTemplateColumns, gridTemplateRows }}
        >
          {/* Current time indicator */}
          {layout === 'vertical' ? (
            <div
              className="pointer-events-none absolute inset-x-0 h-px bg-accent/70"
              style={{ top: `${(nowGridIndex - 1) * 2}rem`, zIndex: 5 }}
            />
          ) : (
            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-accent/70"
              style={{
                left: `calc(5rem + ${(nowGridIndex - 2) * 3}rem)`,
                zIndex: 5,
              }}
            />
          )}

          {/* Top-left empty corner cell */}
          <div
            className="sticky top-0 z-20 border-b border-r border-border bg-card"
            style={{ gridColumn: 1, gridRow: 1 }}
          />

          {/* Header Row (Days for vertical, Times for horizontal) */}
          {layout === 'vertical'
            ? WEEKDAYS.map((d, i) => (
                <div
                  key={d.day}
                  className="sticky top-0 z-20 flex items-center justify-center border-b border-border bg-card text-xs font-semibold text-card-foreground"
                  style={{ gridColumn: i + 2, gridRow: 1 }}
                >
                  <span className="hidden md:inline">{d.label}</span>
                  <span className="md:hidden">{d.short}</span>
                </div>
              ))
            : Array.from({ length: TOTAL_TIME_BLOCKS }, (_, i) => {
                const minutes = DAY_START + i * SLOT_MINUTES
                const isHour = minutes % 60 === 0
                return (
                  <div
                    key={minutes}
                    className="sticky top-0 z-20 border-b border-border bg-card pl-1 pt-1 text-left text-[10px] leading-none text-muted-foreground"
                    style={{ gridColumn: i + 2, gridRow: 1 }}
                  >
                    {isHour ? formatTime(minutes) : ''}
                  </div>
                )
              })}

          {/* Side Column (Times for vertical, Days for horizontal) */}
          {layout === 'vertical'
            ? Array.from({ length: TOTAL_TIME_BLOCKS }, (_, i) => {
                const minutes = DAY_START + i * SLOT_MINUTES
                const isHour = minutes % 60 === 0
                return (
                  <div
                    key={minutes}
                    className="sticky left-0 z-10 border-r border-border bg-card pr-2 pt-0.5 text-right text-[10px] leading-none text-muted-foreground"
                    style={{ gridColumn: 1, gridRow: i + 2 }}
                  >
                    {isHour ? formatTime(minutes) : ''}
                  </div>
                )
              })
            : WEEKDAYS.map((d, i) => (
                <div
                  key={d.day}
                  className="sticky left-0 z-10 flex items-center justify-end border-b border-r border-border bg-card pr-2 text-xs font-semibold text-card-foreground"
                  style={{ gridColumn: 1, gridRow: i + 2 }}
                >
                  <span className="hidden md:inline">{d.label}</span>
                  <span className="md:hidden">{d.short}</span>
                </div>
              ))}

          {/* Background cells for the grid */}
          {layout === 'vertical'
            ? WEEKDAYS.map((d, colIdx) =>
                Array.from({ length: TOTAL_TIME_BLOCKS }, (_, i) => (
                  <div
                    key={`${d.day}-${i}`}
                    className={cn(
                      'border-border',
                      i % 2 === 0 ? 'border-t' : 'border-t border-dashed border-t-border/50',
                      colIdx > 0 && 'border-l'
                    )}
                    style={{ gridColumn: colIdx + 2, gridRow: i + 2 }}
                  />
                ))
              )
            : Array.from({ length: TOTAL_TIME_BLOCKS }, (_, colIdx) =>
                WEEKDAYS.map((d, rowIdx) => (
                  <div
                    key={`${d.day}-${colIdx}`}
                    className={cn(
                      'border-border border-b',
                      colIdx % 2 === 0 ? 'border-l' : 'border-l border-dashed border-l-border/50'
                    )}
                    style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 2 }}
                  />
                ))
              )}

          {/* Scheduled class blocks */}
          {existingClasses.flatMap((cls, classIdx) =>
            cls.schedule
              .filter((slot) => slot.day >= 1 && slot.day <= 7)
              .filter((slot) => slot.end_time > DAY_START && slot.start_time < DAY_END)
              .map((slot, slotIdx) => (
                <div
                  key={`${cls.section_id}-${slotIdx}`}
                  className={cn(
                    'group relative z-30 m-0.5 flex flex-col overflow-hidden rounded-md p-1.5 text-[11px] leading-tight shadow-sm',
                    cls.color ? 'text-white' : BLOCK_COLORS[classIdx % BLOCK_COLORS.length]
                  )}
                  style={{
                    gridColumn:
                      layout === 'vertical'
                        ? slot.day + 1
                        : `${minutesToGridIndex(slot.start_time)} / ${minutesToGridIndex(slot.end_time)}`,
                    gridRow:
                      layout === 'vertical'
                        ? `${minutesToGridIndex(slot.start_time)} / ${minutesToGridIndex(slot.end_time)}`
                        : slot.day + 1,
                    ...(cls.color ? { backgroundColor: cls.color } : {}),
                    animation: 'fadeIn 0.4s ease-out',
                  }}
                >
                  <p className="font-semibold">{cls.course_code}</p>
                  <p className="truncate opacity-90">{cls.section_id}</p>
                  <p className="truncate opacity-75">
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeClass(cls.course_code)}
                    aria-label={`Remove ${cls.course_code} from schedule`}
                    className="absolute right-1 top-1 rounded p-0.5 opacity-0 transition-opacity hover:bg-black/20 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <X aria-hidden="true" className="size-3" />
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </section>
  )
}
