"use client";

/**
 * Client-side store for the course comparison tray.
 * Users select up to 4 courses (from browser or favorites),
 * then view them side-by-side in /courses/compare.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TjuLibCourse } from "@/lib/tju/types";

const MAX_COMPARE = 4;

interface CompareState {
  courses: TjuLibCourse[];
  add: (course: TjuLibCourse) => void;
  remove: (lessionId: string) => void;
  toggle: (course: TjuLibCourse) => void;
  clear: () => void;
  has: (lessionId: string) => boolean;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      courses: [],

      add: (course) => {
        const { courses } = get();
        if (courses.length >= MAX_COMPARE) return;
        if (courses.some((c) => c.lession_id === course.lession_id)) return;
        set({ courses: [...courses, course] });
      },

      remove: (lessionId) => {
        set({ courses: get().courses.filter((c) => c.lession_id !== lessionId) });
      },

      toggle: (course) => {
        const { courses, add, remove } = get();
        if (courses.some((c) => c.lession_id === course.lession_id)) {
          remove(course.lession_id ?? "");
        } else {
          add(course);
        }
      },

      clear: () => set({ courses: [] }),

      has: (lessionId) => get().courses.some((c) => c.lession_id === lessionId),
    }),
    {
      name: "tju-app:compare",
    },
  ),
);

export const MAX_COMPARE_COURSES = MAX_COMPARE;
