import { SidebarNavItem, type NavIconName } from "@/components/layout/nav-item-link";
import type { CurrentUser } from "@/lib/auth";
import { companyDisplayName } from "@/lib/company-display";
import { hasUserPermission, type Permission } from "@/lib/permissions";

const nav: { href: string; label: string; icon: NavIconName; permission: Permission }[] = [
  { href: "/app", label: "Панель", icon: "dashboard", permission: "dashboard:read" },
  { href: "/app/tasks", label: "Задачи", icon: "tasks", permission: "tasks:read" },
  { href: "/app/calendar", label: "Календарь", icon: "calendar", permission: "calendar:read" },
  { href: "/app/inventory", label: "Склад", icon: "inventory", permission: "inventory:read" },
  { href: "/app/qr", label: "QR-коды", icon: "qr", permission: "qr:read" },
  { href: "/app/notifications", label: "Уведомления", icon: "notifications", permission: "notifications:read" },
  { href: "/app/roadmap", label: "План развития", icon: "roadmap", permission: "roadmap:read" },
  { href: "/app/settings", label: "Настройки", icon: "settings", permission: "users:manage" }
];

export function Sidebar({ user }: { user: CurrentUser }) {
  const visible = nav.filter((item) => item.href === "/app/calendar" || hasUserPermission(user, item.permission));

  return (
    <aside className="hidden w-64 shrink-0 border-r border-stroke bg-surface px-4 py-5 lg:block">
      <div className="mb-8">
        <div className="text-lg font-semibold tracking-tight">Акустический отдел</div>
        <div className="mt-1 text-sm text-muted">{companyDisplayName(user.company.name)}</div>
      </div>
      <nav className="space-y-1">
        {visible.map((item) => (
          <SidebarNavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>
    </aside>
  );
}
