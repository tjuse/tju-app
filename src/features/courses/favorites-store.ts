"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TjuLibCourse } from "@/lib/tju/types";

/** 收藏项：存课程快照（跨学期可离线查看），带收藏时间与学期。 */
export interface FavoriteCourse {
  lessionId: string;
  semester: string;
  addedAt: string; // ISO
  course: TjuLibCourse;
}

interface FavoritesState {
  favorites: Record<string, FavoriteCourse>; // key = lessionId
  isFavorite: (lessionId: string | null | undefined) => boolean;
  toggle: (course: TjuLibCourse, semester: string) => void;
  remove: (lessionId: string) => void;
  list: () => FavoriteCourse[];
}

/** 收藏使用 lession_id 作为稳定键；缺失时回退 course_id+class_id。 */
export function courseKey(course: TjuLibCourse): string {
  return course.lession_id ?? `${course.course_id ?? ""}-${course.class_id ?? ""}`;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},
      isFavorite: (id) => (id ? id in get().favorites : false),
      toggle: (course, semester) => {
        const id = courseKey(course);
        set((state) => {
          const next = { ...state.favorites };
          if (next[id]) {
            delete next[id];
          } else {
            next[id] = { lessionId: id, semester, addedAt: new Date().toISOString(), course };
          }
          return { favorites: next };
        });
      },
      remove: (id) =>
        set((state) => {
          const next = { ...state.favorites };
          delete next[id];
          return { favorites: next };
        }),
      list: () => Object.values(get().favorites).sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
    }),
    { name: "tju-app:favorites" },
  ),
);
