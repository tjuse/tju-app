import type { LucideIcon } from "lucide-react";
import { CalendarDays, CreditCard, LayoutDashboard, Link2, Table2, Zap } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Phase 2 功能标记为即将上线 */
  comingSoon?: boolean;
}

export const navItems: NavItem[] = [
  { title: "概览", href: "/", icon: LayoutDashboard },
  { title: "课程表", href: "/schedule", icon: Table2 },
  { title: "校历", href: "/calendar", icon: CalendarDays },
  { title: "常用链接", href: "/links", icon: Link2 },
  { title: "校园卡", href: "/card", icon: CreditCard, comingSoon: true },
  { title: "电费", href: "/electricity", icon: Zap, comingSoon: true },
];
