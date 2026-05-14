import Link from "next/link";
import { Suspense } from "react";
import { Priority, TaskStatus, type Prisma } from "@prisma/client";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskCreateForm } from "@/components/tasks/task-create-form";
import { TaskFilters } from "@/components/tasks/task-filters";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requirePermission, requireUser } from "@/lib/auth";
import { taskScopeFor } from "@/lib/data-scope";
import { canSeeAllCompanyData, hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const statusLabels = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Завершена",
  OVERDUE: "Просрочена"
};

type SearchParams = {
  q?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  projectId?: string;
  mine?: string;
  sort?: string;
};

export default async function TasksPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const user = await requireUser();
  requirePermission(user.role.code, "tasks:read");
  const params = (await searchParams) ?? {};
  const canManageTasks = hasPermission(user.role.code, "tasks:manage");
  const companyWide = canSeeAllCompanyData(user.role.code);
  const departmentFilter = companyWide ? {} : { departmentId: user.departmentId ?? undefined };
  const where = buildTaskWhere(taskScopeFor(user), params, user.id);
  const orderBy = buildOrderBy(params.sort);

  const [tasks, assignees, departments, projects] = await Promise.all([
    prisma.task.findMany({
      where,
      include: { assignee: { select: { name: true } }, creator: { select: { name: true } }, project: { select: { name: true } }, department: true },
      orderBy
    }),
    canManageTasks
      ? prisma.user.findMany({
          where: { companyId: user.companyId, isActive: true, ...departmentFilter },
          select: { id: true, name: true },
          orderBy: { name: "asc" }
        })
      : [],
    canManageTasks
      ? prisma.department.findMany({
          where: { companyId: user.companyId, ...(companyWide ? {} : { id: user.departmentId ?? "" }) },
          select: { id: true, name: true },
          orderBy: { name: "asc" }
        })
      : [],
    canManageTasks
      ? prisma.project.findMany({
          where: {
            companyId: user.companyId,
            ...(companyWide
              ? {}
              : {
                  OR: [
                    { members: { some: { userId: user.id } } },
                    { tasks: { some: { departmentId: user.departmentId } } }
                  ]
                })
          },
          select: { id: true, name: true },
          orderBy: { name: "asc" }
        })
      : []
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <h1 className="text-2xl font-semibold tracking-tight">Задачи</h1>
        {canManageTasks && <TaskCreateForm assignees={assignees} departments={departments} projects={projects} />}
      </div>

      <Suspense fallback={null}>
        <TaskFilters assignees={assignees} projects={projects} />
      </Suspense>

      <TaskBoard
        tasks={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueAt: task.dueAt?.toISOString() ?? null,
          assignee: task.assignee,
          project: task.project
        }))}
      />

      <Card>
        <h2 className="mb-4 text-base font-semibold">Список задач</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr className="border-b border-stroke">
                <th className="py-3 pr-4">Название</th>
                <th className="py-3 pr-4">Исполнитель</th>
                <th className="py-3 pr-4">Проект</th>
                <th className="py-3 pr-4">Статус</th>
                <th className="py-3 pr-4">Срок</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-stroke/70">
                  <td className="py-3 pr-4 font-medium">
                    <Link href={`/app/tasks/${task.id}`} className="transition hover:text-brand">
                      {task.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted">{task.assignee?.name ?? "Не назначен"}</td>
                  <td className="py-3 pr-4 text-muted">{task.project?.name ?? "Без проекта"}</td>
                  <td className="py-3 pr-4">
                    <Badge>{statusLabels[task.status]}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-muted">{formatDate(task.dueAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function buildTaskWhere(baseScope: Prisma.TaskWhereInput, params: SearchParams, userId: string): Prisma.TaskWhereInput {
  const filters: Prisma.TaskWhereInput[] = [baseScope];

  if (params.q?.trim()) {
    const contains = { contains: params.q.trim(), mode: "insensitive" as const };
    filters.push({ OR: [{ title: contains }, { description: contains }] });
  }

  if (isTaskStatus(params.status)) filters.push({ status: params.status });
  if (isPriority(params.priority)) filters.push({ priority: params.priority });
  if (params.assigneeId) filters.push({ assigneeId: params.assigneeId });
  if (params.projectId) filters.push({ projectId: params.projectId });
  if (params.mine === "1") filters.push({ OR: [{ assigneeId: userId }, { creatorId: userId }] });

  return { AND: filters };
}

function buildOrderBy(sort?: string): Prisma.TaskOrderByWithRelationInput[] {
  if (sort === "due") return [{ dueAt: "asc" }, { createdAt: "desc" }];
  if (sort === "priority") return [{ priority: "desc" }, { createdAt: "desc" }];
  return [{ createdAt: "desc" }];
}

function isTaskStatus(value?: string): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}

function isPriority(value?: string): value is Priority {
  return Object.values(Priority).includes(value as Priority);
}
