import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DepartmentCreateForm, DepartmentEditForm, PermissionToggleGrid, UserCreateForm, UserDeleteButton, UserEditForm } from "@/components/settings/settings-forms";
import { requirePermission, requireUser } from "@/lib/auth";
import { hasUserPermission, permissionLabels, permissionsByRole, roleLabels } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const user = await requireUser();
  requirePermission(user, "users:manage");
  const canDevelopSystem = hasUserPermission(user, "system:develop");

  const [users, departments, roles] = await Promise.all([
    prisma.user.findMany({
      where: { companyId: user.companyId },
      include: { role: true, department: true, permissionOverrides: { select: { permission: true, enabled: true } } },
      orderBy: { name: "asc" }
    }),
    prisma.department.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.role.findMany({
      where: { companyId: user.companyId },
      select: { id: true, code: true, name: true },
      orderBy: { code: "asc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Аккаунты и роли</h1>
          <p className="mt-1 text-sm text-muted">Сотрудники, отделы и матрица доступа компании</p>
        </div>
        <UserCreateForm roles={roles} departments={departments} />
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold">Сотрудники</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {users.map((employee) => (
            <div key={employee.id} className="rounded-md bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{employee.name}</div>
                  <div className="mt-1 text-sm text-muted">{employee.email}</div>
                </div>
                <Badge variant={employee.isActive ? "green" : "red"}>{employee.isActive ? "Активен" : "Отключен"}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="green">{roleLabels[employee.role.code]}</Badge>
                <Badge>{employee.department?.name ?? "Без отдела"}</Badge>
                {employee.telegramChatId && <Badge>Telegram</Badge>}
              </div>
              <UserEditForm
                employee={{
                  id: employee.id,
                  name: employee.name,
                  email: employee.email,
                  departmentId: employee.departmentId,
                  telegramChatId: employee.telegramChatId,
                  isActive: employee.isActive,
                  role: { code: employee.role.code },
                  permissionOverrides: employee.permissionOverrides
                }}
                roles={roles}
                departments={departments}
              />
              {employee.id !== user.id && <UserDeleteButton employee={{ id: employee.id, name: employee.name }} />}
              {canDevelopSystem && (
                <PermissionToggleGrid
                  employee={{
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                    departmentId: employee.departmentId,
                    telegramChatId: employee.telegramChatId,
                    isActive: employee.isActive,
                    role: { code: employee.role.code },
                    permissionOverrides: employee.permissionOverrides
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <Card>
          <h2 className="mb-4 text-base font-semibold">Отделы</h2>
          <div className="mb-4">
            <DepartmentCreateForm />
          </div>
          <div className="space-y-2">
            {departments.length === 0 && <p className="text-sm text-muted">Отделов пока нет.</p>}
            {departments.map((department) => (
              <DepartmentEditForm key={department.id} department={department} />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold">Права доступа</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {Object.entries(permissionsByRole).map(([role, permissions]) => (
              <div key={role} className="rounded-md bg-surface p-4">
                <div className="mb-3 font-medium">{roleLabels[role as keyof typeof roleLabels]}</div>
                <div className="flex flex-wrap gap-2">
                  {permissions.map((permission) => (
                    <Badge key={permission}>{permissionLabels[permission]}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
