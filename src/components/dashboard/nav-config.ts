import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Library,
  Link2,
  NotebookPen,
  Table2,
  Zap,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Mark features not yet available without credentials as coming soon. */
  comingSoon?: boolean;
}

export interface NavGroup {
  /** Section label (omit for the top, label-less group). */
  label?: string;
  items: NavItem[];
}

/** Grouped navigation (Cloudflare-style sections). */
export const navGroups: NavGroup[] = [
  {
    items: [{ title: "概览", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "我的",
    items: [
      { title: "课程表", href: "/schedule", icon: Table2 },
      { title: "成绩", href: "/grades", icon: GraduationCap },
      { title: "考试", href: "/exams", icon: NotebookPen },
    ],
  },
  {
    label: "查询",
    items: [
      { title: "公共课表", href: "/courses", icon: Library },
      { title: "校历", href: "/calendar", icon: CalendarDays },
      { title: "常用链接", href: "/links", icon: Link2 },
    ],
  },
  {
    label: "校园生活",
    items: [
      { title: "校园卡", href: "/card", icon: CreditCard, comingSoon: true },
      { title: "电费", href: "/electricity", icon: Zap, comingSoon: true },
    ],
  },
];

/** Flat list (mobile tab bar + anywhere a single sequence is needed). */
export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);
