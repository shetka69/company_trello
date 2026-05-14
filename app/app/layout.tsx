import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { requireUser } from "@/lib/auth";
import { getRealtimeVersion } from "@/lib/realtime-version";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const realtime = await getRealtimeVersion(user);

  return (
    <div className="flex min-h-screen bg-surface text-text">
      <Sidebar user={user} />
      <div className="min-w-0 flex-1">
        <Topbar user={user} unreadCount={realtime.unreadCount} />
        <RealtimeRefresh initialVersion={realtime.version} />
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 lg:px-6 lg:pb-6">{children}</main>
      </div>
      <MobileNav user={user} />
    </div>
  );
}
