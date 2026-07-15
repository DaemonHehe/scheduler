'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Course, ScheduledClass, Section } from '@/types'

interface ScheduleState {
  /** User-created course catalog (persisted). */
  courses: Course[]
  /** Sections the user has added to their weekly schedule. */
  existingClasses: ScheduledClass[]

  // Course catalog CRUD
  addCourse: (course: Course) => void
  removeCourse: (courseCode: string) => void
  editCourse: (courseCode: string, updated: Course) => void

  // Schedule management
  addSection: (course: Course, section: Section) => void
  removeClass: (courseCode: string) => void
  clearSchedule: () => void
  setSchedule: (classes: ScheduledClass[]) => void
  seedDemoData: () => void
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      courses: [],
      existingClasses: [],

      addCourse: (course) => {
        const existing = get().courses
        // Prevent duplicate course codes
        if (existing.some((c) => c.course_code === course.course_code)) return
        set({ courses: [...existing, course] })
      },

      removeCourse: (courseCode) =>
        set({
          courses: get().courses.filter((c) => c.course_code !== courseCode),
          // Also remove from schedule if enrolled
          existingClasses: get().existingClasses.filter(
            (c) => c.course_code !== courseCode,
          ),
        }),

      editCourse: (courseCode, updated) =>
        set({
          courses: get().courses.map((c) =>
            c.course_code === courseCode ? updated : c,
          ),
        }),

      addSection: (course, section) => {
        // Guard: only one section per course. Swapping replaces the old one.
        const withoutCourse = get().existingClasses.filter(
          (c) => c.course_code !== course.course_code,
        )
        set({
          existingClasses: [
            ...withoutCourse,
            {
              course_code: course.course_code,
              course_name: course.name,
              section_id: section.section_id,
              instructor: section.instructor,
              schedule: section.schedule,
              color: course.color,
              credits: course.credits,
            },
          ],
        })
      },

      removeClass: (courseCode) =>
        set({
          existingClasses: get().existingClasses.filter(
            (c) => c.course_code !== courseCode,
          ),
        }),

      clearSchedule: () => set({ existingClasses: [] }),
      setSchedule: (classes) => set({ existingClasses: classes }),
      seedDemoData: () => {
        import('@/lib/demoData').then(({ DEMO_COURSES }) => {
          set({ courses: DEMO_COURSES, existingClasses: [] })
        })
      },
    }),
    {
      name: 'class-schedule-storage',
      partialize: (state) => ({
        courses: state.courses,
        existingClasses: state.existingClasses,
      }),
    },
  ),
)
