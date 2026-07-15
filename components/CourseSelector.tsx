'use client'

import { useMemo, useState, memo, useCallback } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react'
import { checkConflicts, formatSlot } from '@/lib/conflictCheck'
import { cn } from '@/lib/utils'
import { useScheduleStore } from '@/store/useScheduleStore'
import type { Course, Section } from '@/types'
import { AddCourseForm } from './AddCourseForm'

type SectionStatus = 'enrolled' | 'available' | 'too-tight' | 'conflict'

export function CourseSelector() {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const courses = useScheduleStore((s) => s.courses)
  const existingClasses = useScheduleStore((s) => s.existingClasses)
  const addSection = useScheduleStore((s) => s.addSection)
  const addCourse = useScheduleStore((s) => s.addCourse)
  const removeCourse = useScheduleStore((s) => s.removeCourse)

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return courses
    return courses.filter(
      (c) =>
        c.course_code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q),
    )
  }, [query, courses])

  const handleToggle = useCallback((courseCode: string) => {
    setExpanded((prev) => (prev === courseCode ? null : courseCode))
  }, [])

  const handleAddSection = useCallback(
    (course: Course, section: Section) => {
      addSection(course, section)
    },
    [addSection],
  )

  const handleDeleteCourse = useCallback(
    (courseCode: string) => {
      removeCourse(courseCode)
    },
    [removeCourse],
  )

  return (
    <>
      <section 
        aria-label="Course selector" 
        className="flex flex-col gap-3 max-h-[60vh] lg:max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 pb-6 custom-scrollbar"
      >
        <div className="sticky top-0 z-20 flex flex-col gap-3 bg-background pb-3">
          {/* Add Course button */}
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary/60 hover:bg-primary/10"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add New Course
          </button>

          {/* Search */}
          {courses.length > 0 && (
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses by code or name..."
                aria-label="Search courses"
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>

        {/* Course list */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <BookOpen aria-hidden="true" className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No courses yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your first course to start building your schedule
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Course results">
            {filteredCourses.length === 0 && (
              <li className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                No courses match &quot;{query}&quot;
              </li>
            )}
            {filteredCourses.map((course) => (
              <CourseRow
                key={course.course_code}
                course={course}
                isExpanded={expanded === course.course_code}
                onToggle={() => handleToggle(course.course_code)}
                onAddSection={(section) => handleAddSection(course, section)}
                onDeleteCourse={() => handleDeleteCourse(course.course_code)}
                existingClasses={existingClasses}
              />
            ))}
          </ul>
        )}
      </section>

      <AddCourseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={addCourse}
      />
    </>
  )
}

const CourseRow = memo(function CourseRow({
  course,
  isExpanded,
  onToggle,
  onAddSection,
  onDeleteCourse,
  existingClasses,
}: {
  course: Course
  isExpanded: boolean
  onToggle: () => void
  onAddSection: (section: Section) => void
  onDeleteCourse: () => void
  existingClasses: ReturnType<typeof useScheduleStore.getState>['existingClasses']
}) {
  const enrolledSection = existingClasses.find(
    (c) => c.course_code === course.course_code,
  )

  const sectionStatuses = useMemo(() => {
    if (!isExpanded) return new Map<string, ReturnType<typeof getStatus>>()
    const others = existingClasses.filter(
      (c) => c.course_code !== course.course_code,
    )
    const map = new Map<string, ReturnType<typeof getStatus>>()
    for (const section of course.sections) {
      map.set(section.section_id, getStatus(section, others, enrolledSection?.section_id))
    }
    return map
  }, [isExpanded, course, existingClasses, enrolledSection?.section_id])

  return (
    <li className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="flex flex-1 items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-accent"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-card-foreground">
              {course.color && (
                <span
                  className="mr-2 inline-block size-2.5 rounded-full align-middle"
                  style={{ backgroundColor: course.color }}
                />
              )}
              {course.course_code}
              {enrolledSection && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                  Enrolled
                </span>
              )}
            </p>
            <p className="truncate text-sm text-muted-foreground">{course.name}</p>
          </div>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform',
              isExpanded && 'rotate-180',
            )}
          />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDeleteCourse()
          }}
          aria-label={`Delete ${course.course_code}`}
          className="mr-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 aria-hidden="true" className="size-3.5" />
        </button>
      </div>

      {isExpanded && (
        <ul className="flex flex-col gap-2 border-t border-border p-3">
          {course.sections.map((section) => {
            const status = sectionStatuses.get(section.section_id)
            if (!status) return null
            return (
              <SectionRow
                key={section.section_id}
                section={section}
                status={status.status}
                conflictingWith={status.conflictingWith}
                onAdd={() => onAddSection(section)}
              />
            )
          })}
        </ul>
      )}
    </li>
  )
})

function getStatus(
  section: Section,
  otherClasses: ReturnType<typeof useScheduleStore.getState>['existingClasses'],
  enrolledSectionId: string | undefined,
): { status: SectionStatus; conflictingWith: string[] } {
  if (enrolledSectionId === section.section_id) {
    return { status: 'enrolled', conflictingWith: [] }
  }
  const result = checkConflicts(section.schedule, otherClasses)
  if (result.hasConflict) {
    return { status: 'conflict', conflictingWith: result.conflictingWith }
  }
  if (result.isTooTight) {
    return { status: 'too-tight', conflictingWith: result.conflictingWith }
  }
  return { status: 'available', conflictingWith: [] }
}

const STATUS_STYLES: Record<SectionStatus, string> = {
  enrolled: 'border-primary/40 bg-primary/5',
  available: 'border-available/40 bg-available/5',
  'too-tight': 'border-warning/50 bg-warning/10',
  conflict: 'border-destructive/40 bg-destructive/5 opacity-60',
}

const SectionRow = memo(function SectionRow({
  section,
  status,
  conflictingWith,
  onAdd,
}: {
  section: Section
  status: SectionStatus
  conflictingWith: string[]
  onAdd: () => void
}) {
  const isDisabled = status === 'conflict' || status === 'enrolled'

  return (
    <li
      className={cn(
        'flex items-center justify-between gap-3 rounded-md border p-2.5',
        STATUS_STYLES[status],
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <StatusIcon status={status} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-card-foreground">
            {section.section_id}
            <span className="ml-2 font-normal text-muted-foreground">
              {section.instructor}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {section.schedule.map(formatSlot).join(' · ')}
          </p>
          {status === 'conflict' && (
            <p className="text-xs font-medium text-destructive">
              Overlaps with {conflictingWith.join(', ')}
            </p>
          )}
          {status === 'too-tight' && (
            <p className="text-xs font-medium text-warning-foreground">
              Less than 15 min between {conflictingWith.join(', ')}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={isDisabled}
        aria-label={`Add section ${section.section_id}`}
        className={cn(
          'flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
          isDisabled
            ? 'cursor-not-allowed bg-muted text-muted-foreground'
            : 'bg-primary text-primary-foreground hover:opacity-90',
        )}
      >
        {status === 'enrolled' ? (
          <>
            <Check aria-hidden="true" className="size-3.5" /> Added
          </>
        ) : (
          <>
            <Plus aria-hidden="true" className="size-3.5" /> Add
          </>
        )}
      </button>
    </li>
  )
})

function StatusIcon({ status }: { status: SectionStatus }) {
  if (status === 'conflict') {
    return (
      <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
    )
  }
  if (status === 'too-tight') {
    return (
      <AlertTriangle
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-warning-foreground"
      />
    )
  }
  return (
    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-available" />
  )
}
