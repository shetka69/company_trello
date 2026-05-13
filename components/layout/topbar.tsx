import { LogOut } from "lucide-react";
import { GlobalSearch } from "@/components/layout/global-search";
import { initials } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth";
import { roleLabels } from "@/lib/permissions";

export function Topbar({ user, unreadCount }: { user: CurrentUser; unreadCount: number }) {
  return (
    <header className="sticky top-0 z-10 border-b border-stroke bg-surface/92 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <GlobalSearch />
        <div className="hidden text-right sm:block">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-xs text-muted">{roleLabels[user.role.code]}</div>
        </div>
        <div className="relative flex h-10 w-10 items-center justify-center rounded-md border border-stroke bg-panelSoft text-sm font-semibold">
          {initials(user.name)}
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 rounded-md bg-danger px-1.5 text-xs text-white">{unreadCount}</span>}
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="flex h-10 w-10 items-center justify-center rounded-md border border-stroke bg-panel text-muted transition hover:text-text" aria-label="Выйти">
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
