import "server-only";

import { redirect } from "next/navigation";
import type { Prisma, RoleCode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hasPermission, type Permission } from "@/lib/permissions";
import { readSession } from "@/lib/session";

export type CurrentUser = Prisma.UserGetPayload<{
  include: {
    role: true;
    department: true;
    company: true;
  };
}>;

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) return null;

  return prisma.user.findFirst({
    where: {
      id: session.userId,
      companyId: session.companyId,
      isActive: true
    },
    include: {
      role: true,
      department: true,
      company: true
    }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function requirePermission(role: RoleCode, permission: Permission) {
  if (!hasPermission(role, permission)) {
    redirect("/app");
  }
}
