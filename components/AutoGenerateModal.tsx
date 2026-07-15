'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Sunrise, Sunset, Shrink, Expand, AlertCircle } from 'lucide-react'
import { useScheduleStore } from '@/store/useScheduleStore'
import { generateSchedule, type Preference } from '@/lib/generator'

interface AutoGenerateModalProps {
  open: boolean
  onClose: () => void
}

const PREFERENCES = [
  {
    id: 'morning',
    title: 'Morning Person',
    description: 'Prioritize classes that start early in the day.',
    icon: Sunrise,
  },
  {
    id: 'evening',
    title: 'Night Owl',
    description: 'Prioritize classes that start later in the day.',
    icon: Sunset,
  },
  {
    id: 'tight',
    title: 'Compact / Tight',
    description: 'Pack classes into fewest days, back-to-back.',
    icon: Shrink,
  },
  {
    id: 'relax',
    title: 'Relaxed Spread',
    description: 'Spread classes over many days with breaks.',
    icon: Expand,
  },
] as const

export function AutoGenerateModal({ open, onClose }: AutoGenerateModalProps) {
  const courses = useScheduleStore((s) => s.courses)
  const setSchedule = useScheduleStore((s) => s.setSchedule)

  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [preference, setPreference] = useState<Preference>('morning')
  const [error, setError] = useState<string | null>(null)

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setSelectedCourses(new Set(courses.map((c) => c.course_code)))
      setPreference('morning')
      setError(null)
    }
  }, [open, courses])

  if (!open) return null

  const handleToggleCourse = (courseCode: string) => {
    const next = new Set(selectedCourses)
    if (next.has(courseCode)) {
      next.delete(courseCode)
    } else {
      next.add(courseCode)
    }
    setSelectedCourses(next)
  }

  const handleGenerate = () => {
    setError(null)
    if (selectedCourses.size === 0) {
      setError('Please select at least one course.')
      return
    }

    const filteredCourses = courses.filter((c) => selectedCourses.has(c.course_code))
    
    // Attempt generation
    const result = generateSchedule(filteredCourses, preference)

    if (result === null) {
      setError('Impossible to schedule these courses together without time conflicts.')
    } else {
      setSchedule(result)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Auto-Generate Schedule</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <p>Your course catalog is empty.</p>
              <p className="text-sm">Add some courses first before generating.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Course Selection */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-foreground">
                  Select Courses ({selectedCourses.size}/{courses.length})
                </h3>
                <div className="grid max-h-40 gap-2 overflow-y-auto rounded-lg border border-border p-3">
                  {courses.map((course) => (
                    <label
                      key={course.course_code}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.has(course.course_code)}
                        onChange={() => handleToggleCourse(course.course_code)}
                        className="size-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {course.course_code}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {course.name} ({course.sections.length} sections)
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preference Selection */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-foreground">
                  Scheduling Preference
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PREFERENCES.map((pref) => {
                    const Icon = pref.icon
                    const isSelected = preference === pref.id
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => setPreference(pref.id as Preference)}
                        className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border bg-card hover:bg-accent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`size-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                          <span className="text-sm font-semibold text-foreground">
                            {pref.title}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {pref.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border bg-muted/30 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={courses.length === 0}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  )
}
