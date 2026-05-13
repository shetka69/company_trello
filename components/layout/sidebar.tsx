import Link from "next/link";
import { Bell, Boxes, CalendarDays, LayoutDashboard, ListTodo, Settings } from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const nav = [
  { href: "/app", label: "Панель", icon: LayoutDashboard, permission: "dashboard:read" as const },
  { href: "/app/tasks", label: "Задачи", icon: ListTodo, permission: "tasks:read" as const },
  { href: "/app/calendar", label: "Календарь", icon: CalendarDays, permission: "calendar:read" as const },
  { href: "/app/inventory", label: "Склад", icon: Boxes, permission: "inventory:read" as const },
  { href: "/app/notifications", label: "Уведомления", icon: Bell, permission: "notifications:read" as const },
  { href: "/app/settings", label: "Настройки", icon: Settings, permission: "users:manage" as const }
];

export function Sidebar({ user }: { user: CurrentUser }) {
  const visible = nav.filter((item) => hasPermission(user.role.code, item.permission));

  return (
    <aside className="hidden w-64 shrink-0 border-r border-stroke bg-surface px-4 py-5 lg:block">
      <div className="mb-8">
        <div className="text-lg font-semibold tracking-tight">Акустический отдел</div>
        <div className="mt-1 text-sm text-muted">{user.company.name}</div>
      </div>
      <nav className="space-y-1">
        {visible.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition hover:bg-panelSoft hover:text-text"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
