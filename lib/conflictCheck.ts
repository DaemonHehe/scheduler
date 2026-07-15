import type { ConflictResult, ScheduledClass, TimeSlot } from '@/types'

/** Minimum required gap (in minutes) between two classes on the same day. */
export const MIN_GAP_MINUTES = 15

/**
 * Pure function that checks a candidate section's time slots against the
 * user's existing schedule.
 *
 * Rules (evaluated per matching day only):
 * - Hard overlap:  startA < endB  AND  endA > startB          -> hasConflict
 * - Too tight:     0 <= gap < 15 minutes between the classes   -> isTooTight
 *
 * Edge case: a class that ends exactly when another begins (gap === 0)
 * is NOT a hard overlap — it is flagged as "too tight" instead.
 *
 * Complexity: O(n * m) where n = candidate slots, m = total existing slots.
 * Both are tiny in practice (a section rarely has more than 3 meetings).
 */
export function checkConflicts(
  newSlots: TimeSlot[],
  existingClasses: ScheduledClass[],
): ConflictResult {
  let hasConflict = false
  let isTooTight = false
  const conflictingWith = new Set<string>()

  for (const slotA of newSlots) {
    for (const cls of existingClasses) {
      for (const slotB of cls.schedule) {
        // Different days can never interact.
        if (slotA.day !== slotB.day) continue

        // Hard overlap: Start A < End B AND End A > Start B.
        if (slotA.start_time < slotB.end_time && slotA.end_time > slotB.start_time) {
          hasConflict = true
          conflictingWith.add(cls.course_code)
          continue
        }

        // No overlap — measure the gap between the two blocks.
        // If A is before B the gap is B.start - A.end, otherwise A.start - B.end.
        const gap =
          slotA.end_time <= slotB.start_time
            ? slotB.start_time - slotA.end_time
            : slotA.start_time - slotB.end_time

        // Gap of 0 (back-to-back) up to 14 minutes counts as "too tight".
        if (gap >= 0 && gap < MIN_GAP_MINUTES) {
          isTooTight = true
          conflictingWith.add(cls.course_code)
        }
      }
    }
  }

  return { hasConflict, isTooTight, conflictingWith: Array.from(conflictingWith) }
}

/** Formats minutes-from-midnight as a 12-hour time string, e.g. 570 -> "9:30 AM". */
export function formatTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

/** Short day labels indexed by TimeSlot.day (1 = Monday). */
export const DAY_LABELS: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
}

/** Renders a section schedule as e.g. "Mon, Wed 9:00 AM – 10:30 AM". */
export function formatSlot(slot: TimeSlot): string {
  return `${DAY_LABELS[slot.day]} ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
}
