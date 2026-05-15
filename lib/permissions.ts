import type { RoleCode } from "@prisma/client";

export type Permission =
  | "dashboard:read"
  | "tasks:read"
  | "tasks:manage"
  | "calendar:read"
  | "calendar:manage"
  | "inventory:read"
  | "inventory:manage"
  | "qr:read"
  | "qr:manage"
  | "notifications:read"
  | "roadmap:read"
  | "users:manage"
  | "audit:read"
  | "system:develop";

export const permissions: Permission[] = [
  "dashboard:read",
  "tasks:read",
  "tasks:manage",
  "calendar:read",
  "calendar:manage",
  "inventory:read",
  "inventory:manage",
  "qr:read",
  "qr:manage",
  "notifications:read",
  "roadmap:read",
  "users:manage",
  "audit:read",
  "system:develop"
];

export const permissionLabels: Record<Permission, string> = {
  "dashboard:read": "Главная панель",
  "tasks:read": "Просмотр задач",
  "tasks:manage": "Управление задачами",
  "calendar:read": "Просмотр календаря",
  "calendar:manage": "Управление календарем",
  "inventory:read": "Просмотр склада",
  "inventory:manage": "Управление складом",
  "qr:read": "QR-коды",
  "qr:manage": "Управление QR",
  "notifications:read": "Уведомления",
  "roadmap:read": "План развития",
  "users:manage": "Пользователи и отделы",
  "audit:read": "Журнал действий",
  "system:develop": "Технический доступ"
};

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
    "qr:read",
    "qr:manage",
    "notifications:read",
    "roadmap:read"
  ],
  DEVELOPER: [
    "dashboard:read",
    "tasks:read",
    "tasks:manage",
    "calendar:read",
    "calendar:manage",
    "inventory:read",
    "inventory:manage",
    "qr:read",
    "qr:manage",
    "notifications:read",
    "roadmap:read",
    "users:manage",
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
    "qr:read",
    "notifications:read",
    "audit:read"
  ],
  STOREKEEPER: [
    "dashboard:read",
    "tasks:read",
    "calendar:read",
    "inventory:read",
    "inventory:manage",
    "qr:read",
    "qr:manage",
    "notifications:read",
    "audit:read"
  ],
  ENGINEER: ["dashboard:read", "tasks:read", "calendar:read", "inventory:read", "qr:read", "notifications:read"],
  ASSEMBLER: ["dashboard:read", "tasks:read", "calendar:read", "inventory:read", "qr:read", "notifications:read"],
  TECHNOLOGIST: ["dashboard:read", "tasks:read", "calendar:read", "inventory:read", "qr:read", "notifications:read", "audit:read"]
};

export function hasPermission(role: RoleCode, permission: Permission) {
  return permissionsByRole[role].includes(permission);
}

export function hasUserPermission(
  user: { role: { code: RoleCode }; permissionOverrides?: { permission: string; enabled: boolean }[] },
  permission: Permission
) {
  const override = user.permissionOverrides?.find((item) => item.permission === permission);
  if (override) return override.enabled;
  return hasPermission(user.role.code, permission);
}

export function canSeeAllCompanyData(role: RoleCode) {
  return role === "MANAGER" || role === "DEVELOPER";
}

export function canSeeDepartmentData(role: RoleCode) {
  return role === "FOREMAN" || role === "TECHNOLOGIST";
}
