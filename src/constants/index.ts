export const NAV_LINKS = [
  { label: "Dashboard",      href: "/dashboard" },
  { label: "Assignments",    href: "/assignments" },
  { label: "Study Sessions", href: "/study-sessions" },
  { label: "Analytics",      href: "/analytics" },
  { label: "Settings",       href: "/settings" },
];

export const COURSES = [
  "CS 401 - Machine Learning",
  "CS 305 - Database Systems",
  "CS 302 - Operating Systems",
  "CS 410 - Software Engineering",
  "CS 201 - Data Structures",
  "CS 450 - Algorithm Analysis",
];

export const PRIORITY_OPTIONS = ["high", "medium", "low"] as const;
export const STATUS_OPTIONS    = ["pending", "in progress", "completed"] as const;

export type Priority = typeof PRIORITY_OPTIONS[number];
export type Status   = typeof STATUS_OPTIONS[number];