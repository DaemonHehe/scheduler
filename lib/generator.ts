import { Course, ScheduledClass, Section } from '@/types'
import { checkConflicts } from './conflictCheck'

export type Preference = 'morning' | 'evening' | 'tight' | 'relax'

type CourseSection = { course: Course; section: Section }

/**
 * Computes all possible combinations of sections for the given courses.
 * (Cartesian product of courses -> sections)
 */
function getCombinations(courses: Course[]): CourseSection[][] {
  const result: CourseSection[][] = []

  function helper(courseIndex: number, currentCombo: CourseSection[]) {
    if (courseIndex === courses.length) {
      result.push([...currentCombo])
      return
    }

    const course = courses[courseIndex]
    // If a course has no sections, we just skip it but continue generating
    if (!course.sections || course.sections.length === 0) {
      helper(courseIndex + 1, currentCombo)
      return
    }

    for (const section of course.sections) {
      currentCombo.push({ course, section })
      helper(courseIndex + 1, currentCombo)
      currentCombo.pop()
    }
  }

  helper(0, [])
  return result
}

/**
 * Scores a combination based on user preference. Higher score is better.
 */
function scoreCombination(combo: CourseSection[], preference: Preference): number {
  let totalStartTime = 0
  const daysUsed = new Set<number>()
  const slotsByDay = new Map<number, { start: number; end: number }[]>()

  for (const item of combo) {
    for (const slot of item.section.schedule) {
      totalStartTime += slot.start_time
      daysUsed.add(slot.day)

      if (!slotsByDay.has(slot.day)) {
        slotsByDay.set(slot.day, [])
      }
      slotsByDay.get(slot.day)!.push({ start: slot.start_time, end: slot.end_time })
    }
  }

  let totalGapTime = 0
  for (const [, slots] of Array.from(slotsByDay.entries())) {
    slots.sort((a, b) => a.start - b.start)
    for (let i = 0; i < slots.length - 1; i++) {
      totalGapTime += Math.max(0, slots[i + 1].start - slots[i].end)
    }
  }

  switch (preference) {
    case 'morning':
      // Minimize total start time -> maximize its negative
      return -totalStartTime
    case 'evening':
      // Maximize total start time
      return totalStartTime
    case 'tight':
      // Minimize days on campus (heavy weight), then minimize gap time
      return -10000 * daysUsed.size - totalGapTime
    case 'relax':
      // Maximize days on campus (heavy weight), then maximize gap time
      return 10000 * daysUsed.size + totalGapTime
    default:
      return 0
  }
}

/**
 * Generates the best schedule from a list of courses based on a preference.
 * Returns null if no conflict-free schedule exists for the exact list of courses.
 */
export function generateSchedule(
  courses: Course[],
  preference: Preference,
): ScheduledClass[] | null {
  if (courses.length === 0) return []

  const combinations = getCombinations(courses)

  // Filter valid (no hard conflicts)
  const validCombinations = combinations.filter((combo) => {
    let hasConflict = false
    const currentClasses: ScheduledClass[] = []

    for (const item of combo) {
      const conflictResult = checkConflicts(item.section.schedule, currentClasses)
      if (conflictResult.hasConflict) {
        hasConflict = true
        break
      }
      // Add to currentClasses so next items in this combo check against it
      currentClasses.push({
        course_code: item.course.course_code,
        course_name: item.course.name,
        section_id: item.section.section_id,
        instructor: item.section.instructor,
        schedule: item.section.schedule,
        color: item.course.color,
        credits: item.course.credits,
      })
    }

    return !hasConflict
  })

  if (validCombinations.length === 0) {
    return null
  }

  // Score and find best
  let bestScore = -Infinity
  let bestCombo = validCombinations[0]

  for (const combo of validCombinations) {
    const score = scoreCombination(combo, preference)
    if (score > bestScore) {
      bestScore = score
      bestCombo = combo
    }
  }

  // Map back to ScheduledClass[]
  return bestCombo.map((item) => ({
    course_code: item.course.course_code,
    course_name: item.course.name,
    section_id: item.section.section_id,
    instructor: item.section.instructor,
    schedule: item.section.schedule,
    color: item.course.color,
    credits: item.course.credits,
  }))
}
