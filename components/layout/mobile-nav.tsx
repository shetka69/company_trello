import Link from "next/link";
import { Bell, Boxes, CalendarDays, LayoutDashboard, ListTodo } from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const nav = [
  { href: "/app", label: "Панель", icon: LayoutDashboard, permission: "dashboard:read" as const },
  { href: "/app/tasks", label: "Задачи", icon: ListTodo, permission: "tasks:read" as const },
  { href: "/app/calendar", label: "Календарь", icon: CalendarDays, permission: "calendar:read" as const },
  { href: "/app/inventory", label: "Склад", icon: Boxes, permission: "inventory:read" as const },
  { href: "/app/notifications", label: "Уведомления", icon: Bell, permission: "notifications:read" as const }
];

export function MobileNav({ user }: { user: CurrentUser }) {
  const visible = nav.filter((item) => hasPermission(user.role.code, item.permission));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-stroke bg-surface/95 px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      {visible.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className="flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] text-muted min-[390px]:text-[11px]">
            <Icon size={18} />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
