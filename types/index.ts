/**
 * Core data models for the class scheduling application.
 * All times are stored as minutes from midnight (e.g. 8:00 AM = 480).
 */

/** A single meeting block for a section. */
export interface TimeSlot {
  /** Day of week: 1 = Monday ... 7 = Sunday */
  day: number
  /** Start time in minutes from midnight */
  start_time: number
  /** End time in minutes from midnight */
  end_time: number
}

/** A specific offering of a course (instructor + meeting times). */
export interface Section {
  section_id: string
  instructor: string
  schedule: TimeSlot[]
}

/** A course in the catalog with one or more sections. */
export interface Course {
  course_code: string
  name: string
  sections: Section[]
  /** Optional UI color for consistent styling */
  color?: string
  /** Optional credit count for statistics */
  credits?: number
}

/** A section the user has added to their schedule (denormalized for display). */
export interface ScheduledClass {
  course_code: string
  course_name: string
  section_id: string
  instructor: string
  schedule: TimeSlot[]
  /** UI color inherited from Course */
  color?: string
  /** Credits inherited from Course */
  credits?: number
}

/** Result of running conflict detection for a candidate section. */
export interface ConflictResult {
  hasCollision: boolean
  isTooTight: boolean
  /** Course codes involved in the conflict / tight gap, for messaging. */
  conflictingWith: string[]
}
