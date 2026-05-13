import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unreadCount = await prisma.notification.count({
    where: {
      companyId: user.companyId,
      OR: [{ userId: user.id }, { userId: null }],
      readAt: null
    }
  });

  return (
    <div className="flex min-h-screen bg-surface text-text">
      <Sidebar user={user} />
      <div className="min-w-0 flex-1">
        <Topbar user={user} unreadCount={unreadCount} />
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 lg:px-6 lg:pb-6">{children}</main>
      </div>
      <MobileNav user={user} />
    </div>
  );
}
