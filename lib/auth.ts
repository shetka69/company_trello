import "server-only";

import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hasUserPermission, type Permission } from "@/lib/permissions";
import { readSession } from "@/lib/session";

export type CurrentUser = Prisma.UserGetPayload<{
  include: {
    role: true;
    department: true;
    company: true;
    permissionOverrides: {
      select: {
        permission: true;
        enabled: true;
      };
    };
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
      company: true,
      permissionOverrides: {
        select: {
          permission: true,
          enabled: true
        }
      }
    }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function requirePermission(user: CurrentUser, permission: Permission) {
  if (!hasUserPermission(user, permission)) {
    redirect("/app");
  }
}
