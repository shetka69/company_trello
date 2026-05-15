import { MobileNavItem, type NavIconName } from "@/components/layout/nav-item-link";
import type { CurrentUser } from "@/lib/auth";
import { hasUserPermission, type Permission } from "@/lib/permissions";

const nav: { href: string; label: string; icon: NavIconName; permission: Permission }[] = [
  { href: "/app", label: "Панель", icon: "dashboard", permission: "dashboard:read" },
  { href: "/app/tasks", label: "Задачи", icon: "tasks", permission: "tasks:read" },
  { href: "/app/calendar", label: "Календарь", icon: "calendar", permission: "calendar:read" },
  { href: "/app/inventory", label: "Склад", icon: "inventory", permission: "inventory:read" },
  { href: "/app/qr", label: "QR", icon: "qr", permission: "qr:read" },
  { href: "/app/notifications", label: "Увед.", icon: "notifications", permission: "notifications:read" },
  { href: "/app/roadmap", label: "План", icon: "roadmap", permission: "roadmap:read" }
];

export function MobileNav({ user }: { user: CurrentUser }) {
  const visible = nav.filter((item) => item.href === "/app/calendar" || hasUserPermission(user, item.permission));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 grid border-t border-stroke bg-surface/95 px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
      style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}
    >
      {visible.map((item) => (
        <MobileNavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
      ))}
    </nav>
  );
}
