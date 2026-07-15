'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Check, GraduationCap } from 'lucide-react'
import type { Course } from '@/types'

/* ------------------------------------------------------------------ */
/*  Helpers & Constants                                                */
/* ------------------------------------------------------------------ */

function formatTimeOption(minutes: number): string {
  const h24 = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

function minutesToTimeInput(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function timeInputToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}const PRESET_COLORS = [
  { value: 'oklch(0.73 0.23 260)', label: 'Indigo' },
  { value: 'oklch(0.68 0.22 330)', label: 'Violet' },
  { value: 'oklch(0.65 0.25 180)', label: 'Teal' },
  { value: 'oklch(0.69 0.24 90)', label: 'Amber' },
  { value: 'oklch(0.71 0.23 20)', label: 'Rose' },
  { value: 'oklch(0.72 0.20 145)', label: 'Emerald' },
  { value: 'oklch(0.67 0.22 290)', label: 'Purple' },
  { value: 'oklch(0.75 0.18 60)', label: 'Orange' },
]

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
]

/* ------------------------------------------------------------------ */
/*  Internal form-state types                                          */
/* ------------------------------------------------------------------ */

interface TimeSlotForm {
  day: number
  start_time: number
  end_time: number
}

interface SectionForm {
  section_id: string
  instructor: string
  schedule: TimeSlotForm[]
}

interface FormErrors {
  course_code?: string
  name?: string
  sections?: {
    [sectionIdx: number]: {
      section_id?: string
      schedule?: {
        [slotIdx: number]: {
          end_time?: string
        }
      }
      general?: string
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

function defaultTimeSlot(): TimeSlotForm {
  return { day: 1, start_time: 480, end_time: 510 }
}

function defaultSection(): SectionForm {
  return { section_id: '', instructor: '', schedule: [defaultTimeSlot()] }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface AddCourseFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (course: Course) => void
}

export function AddCourseForm({ open, onClose, onSubmit }: AddCourseFormProps) {
  /* ---- state ---- */
  const [courseCode, setCourseCode] = useState('')
  const [courseName, setCourseName] = useState('')
  const [credits, setCredits] = useState<string>('')
  const [color, setColor] = useState(PRESET_COLORS[0].value)
  const [sections, setSections] = useState<SectionForm[]>([defaultSection()])
  const [errors, setErrors] = useState<FormErrors>({})

  /* ---- reset when panel opens ---- */
  useEffect(() => {
    if (open) {
      setCourseCode('')
      setCourseName('')
      setCredits('')
      setColor(PRESET_COLORS[0].value)
      setSections([defaultSection()])
      setErrors({})
    }
  }, [open])

  /* ---- render nothing when closed ---- */
  if (!open) return null

  /* ---------------------------------------------------------------- */
  /*  Section / time-slot mutators                                     */
  /* ---------------------------------------------------------------- */

  function updateSection(idx: number, patch: Partial<SectionForm>) {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  function removeSection(idx: number) {
    setSections((prev) => prev.filter((_, i) => i !== idx))
  }

  function addSection() {
    setSections((prev) => [...prev, defaultSection()])
  }

  function updateTimeSlot(secIdx: number, slotIdx: number, patch: Partial<TimeSlotForm>) {
    setSections((prev) =>
      prev.map((sec, si) => {
        if (si !== secIdx) return sec
        const newSchedule = sec.schedule.map((ts, ti) => {
          if (ti !== slotIdx) return ts
          const updated = { ...ts, ...patch }
          // auto-fix end_time when start_time changes
          if (patch.start_time !== undefined && updated.end_time <= updated.start_time) {
            updated.end_time = updated.start_time + 30
          }
          return updated
        })
        return { ...sec, schedule: newSchedule }
      }),
    )
  }

  function removeTimeSlot(secIdx: number, slotIdx: number) {
    setSections((prev) =>
      prev.map((sec, si) => {
        if (si !== secIdx) return sec
        return { ...sec, schedule: sec.schedule.filter((_, ti) => ti !== slotIdx) }
      }),
    )
  }

  function addTimeSlot(secIdx: number) {
    setSections((prev) =>
      prev.map((sec, si) => {
        if (si !== secIdx) return sec
        return { ...sec, schedule: [...sec.schedule, defaultTimeSlot()] }
      }),
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Validation                                                       */
  /* ---------------------------------------------------------------- */

  function validate(): boolean {
    const errs: FormErrors = {}
    let valid = true

    if (!courseCode.trim()) {
      errs.course_code = 'Course code is required'
      valid = false
    }
    if (!courseName.trim()) {
      errs.name = 'Course name is required'
      valid = false
    }

    if (sections.length === 0) {
      errs.sections = { 0: { general: 'At least one section is required' } }
      valid = false
    }

    const secErrors: FormErrors['sections'] = {}
    sections.forEach((sec, si) => {
      const se: (typeof secErrors)[number] = {}
      if (!sec.section_id.trim()) {
        se.section_id = 'Section ID is required'
        valid = false
      }
      if (sec.schedule.length === 0) {
        se.general = 'At least one time slot is required'
        valid = false
      }
      const slotErrors: { [slotIdx: number]: { end_time?: string } } = {}
      sec.schedule.forEach((ts, ti) => {
        if (ts.end_time <= ts.start_time) {
          slotErrors[ti] = { end_time: 'End time must be after start time' }
          valid = false
        }
      })
      if (Object.keys(slotErrors).length) se.schedule = slotErrors
      if (Object.keys(se).length) secErrors[si] = se
    })
    if (Object.keys(secErrors).length) errs.sections = secErrors

    setErrors(errs)
    return valid
  }

  /* ---------------------------------------------------------------- */
  /*  Submit                                                           */
  /* ---------------------------------------------------------------- */

  function handleSubmit() {
    if (!validate()) return

    const course: Course = {
      course_code: courseCode.trim(),
      name: courseName.trim(),
      color,
      credits: credits ? Number(credits) : undefined,
      sections: sections.map((s) => ({
        section_id: s.section_id.trim(),
        instructor: s.instructor.trim(),
        schedule: s.schedule.map((ts) => ({
          day: ts.day,
          start_time: ts.start_time,
          end_time: ts.end_time,
        })),
      })),
    }

    onSubmit(course)
    onClose()
  }

  /* ---------------------------------------------------------------- */
  /*  Shared input class                                               */
  /* ---------------------------------------------------------------- */

  const inputCls =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors'

  const selectCls =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors appearance-none'

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex justify-end transition-all duration-300 ease-out"
      onClick={onClose}
    >
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out" />

      {/* panel */}
      <div
        className="relative z-10 flex h-full w-full max-w-lg flex-col bg-card text-card-foreground shadow-2xl transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ------- Header ------- */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Add New Course</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ------- Scrollable body ------- */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-5">
            {/* Course Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Course Code <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CS 101"
                className={inputCls}
              />
              {errors.course_code && (
                <p className="text-xs text-destructive">{errors.course_code}</p>
              )}
            </div>

            {/* Course Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Course Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Introduction to Computer Science"
                className={inputCls}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Credits */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Credits</label>
              <input
                type="number"
                min={1}
                max={6}
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="3"
                className={inputCls}
              />
            </div>

            {/* Color swatches */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Color</label>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => setColor(c.value)}
                    className={`relative h-7 w-7 rounded-full transition-all duration-200 ${
                      color === c.value
                        ? 'ring-2 ring-offset-2 ring-offset-card ring-primary scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.value }}
                  >
                    {color === c.value && (
                      <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ---- Sections ---- */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">
                Sections <span className="text-destructive">*</span>
              </label>

              {sections.map((sec, secIdx) => {
                const secErr = errors.sections?.[secIdx]
                return (
                  <div
                    key={secIdx}
                    className="relative rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-4"
                  >
                    {/* remove section */}
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(secIdx)}
                        className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        aria-label="Remove section"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Section {secIdx + 1}
                    </p>

                    {/* Section ID */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground">Section ID</label>
                      <input
                        type="text"
                        value={sec.section_id}
                        onChange={(e) => updateSection(secIdx, { section_id: e.target.value })}
                        placeholder="e.g. CS101-A"
                        className={inputCls}
                      />
                      {secErr?.section_id && (
                        <p className="text-xs text-destructive">{secErr.section_id}</p>
                      )}
                    </div>

                    {/* Instructor */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground">Instructor</label>
                      <input
                        type="text"
                        value={sec.instructor}
                        onChange={(e) => updateSection(secIdx, { instructor: e.target.value })}
                        placeholder="e.g. Dr. Smith"
                        className={inputCls}
                      />
                    </div>

                    {/* Time Slots */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-medium text-foreground">Time Slots</label>

                      {sec.schedule.map((ts, slotIdx) => {
                        const slotErr = secErr?.schedule?.[slotIdx]

                        return (
                          <div key={slotIdx} className="flex flex-col gap-1.5">
                            <div className="flex items-end gap-2">
                              {/* Day */}
                              <div className="flex flex-1 flex-col gap-1">
                                <span className="text-[11px] text-muted-foreground">Day</span>
                                <select
                                  value={ts.day}
                                  onChange={(e) =>
                                    updateTimeSlot(secIdx, slotIdx, { day: Number(e.target.value) })
                                  }
                                  className={selectCls}
                                >
                                  {DAYS.map((d) => (
                                    <option key={d.value} value={d.value}>
                                      {d.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Start */}
                              <div className="flex flex-1 flex-col gap-1">
                                <span className="text-[11px] text-muted-foreground">Start</span>
                                <input
                                  type="time"
                                  value={minutesToTimeInput(ts.start_time)}
                                  onChange={(e) =>
                                    updateTimeSlot(secIdx, slotIdx, {
                                      start_time: timeInputToMinutes(e.target.value),
                                    })
                                  }
                                  className={inputCls}
                                />
                              </div>

                              {/* End */}
                              <div className="flex flex-1 flex-col gap-1">
                                <span className="text-[11px] text-muted-foreground">End</span>
                                <input
                                  type="time"
                                  value={minutesToTimeInput(ts.end_time)}
                                  onChange={(e) =>
                                    updateTimeSlot(secIdx, slotIdx, {
                                      end_time: timeInputToMinutes(e.target.value),
                                    })
                                  }
                                  className={inputCls}
                                />
                              </div>

                              {/* Remove slot */}
                              {sec.schedule.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTimeSlot(secIdx, slotIdx)}
                                  className="mb-0.5 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
                                  aria-label="Remove time slot"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            {slotErr?.end_time && (
                              <p className="text-xs text-destructive">{slotErr.end_time}</p>
                            )}
                          </div>
                        )
                      })}

                      {secErr?.general && (
                        <p className="text-xs text-destructive">{secErr.general}</p>
                      )}

                      {/* + Add Time Slot */}
                      <button
                        type="button"
                        onClick={() => addTimeSlot(secIdx)}
                        className="flex items-center gap-1.5 self-start rounded-md px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Time Slot
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* + Add Section */}
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1.5 self-start rounded-md border border-dashed border-border px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            </div>
          </div>
        </div>

        {/* ------- Footer ------- */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Add Course
          </button>
        </div>
      </div>
    </div>
  )
}
