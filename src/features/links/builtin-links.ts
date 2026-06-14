import type { Link } from "@/types";

/**
 * Built-in TJU quick links — publicly accessible portals (no login required).
 * Users can add/remove custom links on top of these (stored locally).
 */
export const builtInLinks: Omit<Link, "id">[] = [
  // ─── Academic ────────────────────────────────────────────────
  {
    title: "教务处",
    url: "https://oaa.tju.edu.cn/",
    category: "教务学习",
    icon: "GraduationCap",
    order: 1,
    isBuiltIn: true,
  },
  {
    title: "选课系统",
    url: "http://classes.tju.edu.cn/",
    category: "教务学习",
    icon: "BookOpen",
    order: 2,
    isBuiltIn: true,
  },
  {
    title: "图书馆",
    url: "https://lib.tju.edu.cn/",
    category: "教务学习",
    icon: "Library",
    order: 3,
    isBuiltIn: true,
  },
  {
    title: "Canvas 教学平台",
    url: "https://canvas.tju.edu.cn/",
    category: "教务学习",
    icon: "MonitorPlay",
    order: 4,
    isBuiltIn: true,
  },

  // ─── Identity portals ─────────────────────────────────────────
  {
    title: "统一身份认证",
    url: "https://sso.tju.edu.cn/cas/login",
    category: "身份门户",
    icon: "KeyRound",
    order: 1,
    isBuiltIn: true,
  },
  {
    title: "信息门户",
    url: "https://my.tju.edu.cn/",
    category: "身份门户",
    icon: "LayoutGrid",
    order: 2,
    isBuiltIn: true,
  },
  {
    title: "学生邮箱",
    url: "https://mail.tju.edu.cn/",
    category: "身份门户",
    icon: "Mail",
    order: 3,
    isBuiltIn: true,
  },

  // ─── Campus life ──────────────────────────────────────────────
  {
    title: "校园卡服务",
    url: "https://card.tju.edu.cn/",
    category: "校园生活",
    icon: "CreditCard",
    order: 1,
    isBuiltIn: true,
  },
  {
    title: "后勤保障",
    url: "https://hqbz.tju.edu.cn/",
    category: "校园生活",
    icon: "Building2",
    order: 2,
    isBuiltIn: true,
  },
  {
    title: "校医院",
    url: "https://yiyuan.tju.edu.cn/",
    category: "校园生活",
    icon: "Stethoscope",
    order: 3,
    isBuiltIn: true,
  },

  // ─── Tools & resources ────────────────────────────────────────
  {
    title: "北洋维基",
    url: "https://wiki.tjubot.cn/",
    category: "工具资源",
    icon: "BookMarked",
    order: 1,
    isBuiltIn: true,
  },
  {
    title: "天大主页",
    url: "https://www.tju.edu.cn/",
    category: "工具资源",
    icon: "Home",
    order: 2,
    isBuiltIn: true,
  },
];
