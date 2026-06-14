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

export const navItems: NavItem[] = [
  { title: "概览", href: "/", icon: LayoutDashboard },
  { title: "公共课表", href: "/courses", icon: Library },
  { title: "校历", href: "/calendar", icon: CalendarDays },
  { title: "常用链接", href: "/links", icon: Link2 },
  { title: "课程表", href: "/schedule", icon: Table2 },
  { title: "成绩", href: "/grades", icon: GraduationCap },
  { title: "考试", href: "/exams", icon: NotebookPen },
  { title: "校园卡", href: "/card", icon: CreditCard, comingSoon: true },
  { title: "电费", href: "/electricity", icon: Zap, comingSoon: true },
];
