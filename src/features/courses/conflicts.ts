/**
 * Course conflict detection for a set of favorited courses.
 *
 * Two courses conflict when they share the same weekday AND their class-period
 * ranges overlap AND their teaching-week sets overlap. All three conditions
 * must hold for a genuine time conflict.
 *
 * Uses mapTjuCourse() from the schedule mapper to flatten each TjuLibCourse's
 * arrange[] into the same flat Course shape used by the timetable renderer.
 */
import { mapTjuCourse } from "@/features/schedule/mapping";
import type { TjuLibCourse } from "@/lib/tju/types";
import type { Course } from "@/types";

/** One half of a conflict pair (a single timetable slot). */
export interface ConflictSlot {
  course: TjuLibCourse;
  slot: Course; // the specific arrange segment that conflicts
}

/** A conflict between two courses at a specific time slot. */
export interface Conflict {
  a: ConflictSlot;
  b: ConflictSlot;
  /** Weeks on which the conflict actually occurs. */
  conflictWeeks: number[];
}

/** Flatten a TjuLibCourse into its timetable slots (one per arrange segment). */
function toSlots(course: TjuLibCourse): Course[] {
  return mapTjuCourse(course, course.semester ?? undefined);
}

function weeksOverlap(wa: number[], wb: number[]): number[] {
  const setB = new Set(wb);
  return wa.filter((w) => setB.has(w));
}

function periodsOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA <= endB && startB <= endA;
}

/**
 * Detect all time conflicts among the given courses.
 * Returns a deduplicated list of conflict pairs (each pair appears once).
 */
export function detectConflicts(courses: TjuLibCourse[]): Conflict[] {
  // Build a flat list of (course, slot) pairs.
  const entries: { course: TjuLibCourse; slot: Course }[] = [];
  for (const c of courses) {
    for (const slot of toSlots(c)) {
      entries.push({ course: c, slot });
    }
  }

  const conflicts: Conflict[] = [];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];

      // Skip if from the same course (different arrange segments of the same
      // course are not a conflict).
      if (a.course.lession_id !== null && a.course.lession_id === b.course.lession_id) {
        continue;
      }
      if (
        a.course.course_id !== null &&
        a.course.course_id === b.course.course_id &&
        a.course.class_id !== null &&
        a.course.class_id === b.course.class_id
      ) {
        continue;
      }

      // Weekday must match.
      if (a.slot.weekday !== b.slot.weekday) continue;

      // Class-period ranges must overlap.
      if (!periodsOverlap(a.slot.startSlot, a.slot.endSlot, b.slot.startSlot, b.slot.endSlot)) {
        continue;
      }

      // Teaching weeks must overlap.
      const sharedWeeks = weeksOverlap(a.slot.weeks, b.slot.weeks);
      if (sharedWeeks.length === 0) continue;

      conflicts.push({
        a: { course: a.course, slot: a.slot },
        b: { course: b.course, slot: b.slot },
        conflictWeeks: sharedWeeks,
      });
    }
  }

  return conflicts;
}
