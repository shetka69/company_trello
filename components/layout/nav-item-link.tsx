"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Boxes, CalendarDays, LayoutDashboard, ListTodo, Milestone, QrCode, Settings, type LucideIcon } from "lucide-react";

const icons = {
  dashboard: LayoutDashboard,
  tasks: ListTodo,
  calendar: CalendarDays,
  inventory: Boxes,
  qr: QrCode,
  notifications: Bell,
  roadmap: Milestone,
  settings: Settings
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof icons;

export function SidebarNavItem({ href, label, icon }: { href: string; label: string; icon: NavIconName }) {
  const pathname = usePathname();
  const active = href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
  const Icon = icons[icon];

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
        active ? "bg-brand/12 text-emerald-100 ring-1 ring-brand/30" : "text-muted hover:bg-panelSoft hover:text-text"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

export function MobileNavItem({ href, label, icon }: { href: string; label: string; icon: NavIconName }) {
  const pathname = usePathname();
  const active = href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
  const Icon = icons[icon];

  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] transition min-[390px]:text-[11px] ${
        active ? "bg-brand/12 text-emerald-100 ring-1 ring-brand/25" : "text-muted"
      }`}
    >
      <Icon size={18} />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}
