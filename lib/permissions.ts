import type { RoleCode } from "@prisma/client";

export type Permission =
  | "dashboard:read"
  | "tasks:read"
  | "tasks:manage"
  | "calendar:read"
  | "calendar:manage"
  | "inventory:read"
  | "inventory:manage"
  | "notifications:read"
  | "users:manage"
  | "audit:read"
  | "system:develop";

export const roleLabels: Record<RoleCode, string> = {
  DEVELOPER: "Разработчик",
  MANAGER: "Руководитель",
  ENGINEER: "Инженер",
  ASSEMBLER: "Сборщик",
  FOREMAN: "Бригадир",
  STOREKEEPER: "Кладовщик",
  TECHNOLOGIST: "Технолог"
};

export const permissionsByRole: Record<RoleCode, Permission[]> = {
  MANAGER: [
    "dashboard:read",
    "tasks:read",
    "tasks:manage",
    "calendar:read",
    "calendar:manage",
    "inventory:read",
    "inventory:manage",
    "notifications:read",
    "users:manage",
    "audit:read"
  ],
  DEVELOPER: [
    "dashboard:read",
    "tasks:read",
    "tasks:manage",
    "calendar:read",
    "inventory:read",
    "notifications:read",
    "audit:read",
    "system:develop"
  ],
  FOREMAN: [
    "dashboard:read",
    "tasks:read",
    "tasks:manage",
    "calendar:read",
    "calendar:manage",
    "inventory:read",
    "notifications:read",
    "audit:read"
  ],
  STOREKEEPER: [
    "dashboard:read",
    "tasks:read",
    "calendar:read",
    "inventory:read",
    "inventory:manage",
    "notifications:read",
    "audit:read"
  ],
  ENGINEER: ["dashboard:read", "tasks:read", "calendar:read", "inventory:read", "notifications:read"],
  ASSEMBLER: ["dashboard:read", "tasks:read", "calendar:read", "inventory:read", "notifications:read"],
  TECHNOLOGIST: ["dashboard:read", "tasks:read", "calendar:read", "inventory:read", "notifications:read", "audit:read"]
};

export function hasPermission(role: RoleCode, permission: Permission) {
  return permissionsByRole[role].includes(permission);
}

export function canSeeAllCompanyData(role: RoleCode) {
  return role === "MANAGER" || role === "DEVELOPER";
}

export function canSeeDepartmentData(role: RoleCode) {
  return role === "FOREMAN" || role === "TECHNOLOGIST";
}
