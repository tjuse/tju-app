import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { CoursesTabs } from "@/features/courses/courses-tabs";
import { FavoritesView } from "@/features/courses/favorites-view";

export const metadata = { title: "收藏课程" };

export default function FavoritesPage() {
  return (
    <>
      <Header title="公共课表" subtitle="我的收藏 · 跨学期" />
      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8">
        <CoursesTabs />
        <FadeIn>
          <FavoritesView />
        </FadeIn>
      </div>
    </>
  );
}
