import type { CurrentUser } from "@/lib/auth";
import { canSeeAllCompanyData, canSeeDepartmentData } from "@/lib/permissions";

export function taskScopeFor(user: CurrentUser) {
  const role = user.role.code;

  if (canSeeAllCompanyData(role)) {
    return { companyId: user.companyId };
  }

  if (canSeeDepartmentData(role) && user.departmentId) {
    return {
      companyId: user.companyId,
      OR: [{ departmentId: user.departmentId }, { assigneeId: user.id }, { creatorId: user.id }]
    };
  }

  return {
    companyId: user.companyId,
    OR: [{ assigneeId: user.id }, { creatorId: user.id }]
  };
}

export function inventoryScopeFor(user: CurrentUser) {
  if (user.role.code === "STOREKEEPER" || user.role.code === "MANAGER" || user.role.code === "DEVELOPER") {
    return { companyId: user.companyId };
  }

  return { companyId: user.companyId };
}
