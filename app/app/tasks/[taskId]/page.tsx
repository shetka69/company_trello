import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChecklistForm, ChecklistToggle, CommentForm, TaskDeleteButton, TaskEditForm, TaskStatusQuickActions } from "@/components/tasks/task-detail-actions";
import { requirePermission, requireUser } from "@/lib/auth";
import { taskScopeFor } from "@/lib/data-scope";
import { canSeeAllCompanyData, hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { markOverdueTasks } from "@/lib/tasks-maintenance";
import { formatDate } from "@/lib/utils";

const statusLabels = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Завершена",
  OVERDUE: "Просрочена"
};

const priorityLabels = {
  LOW: "Низкий",
  NORMAL: "Обычный",
  HIGH: "Важный",
  CRITICAL: "Критический"
};

function priorityVariant(priority: keyof typeof priorityLabels) {
  if (priority === "CRITICAL") return "red" as const;
  if (priority === "HIGH") return "red" as const;
  if (priority === "LOW") return "blue" as const;
  return "neutral" as const;
}

export default async function TaskDetailsPage({ params }: { params: Promise<{ taskId: string }> }) {
  const user = await requireUser();
  requirePermission(user, "tasks:read");
  await markOverdueTasks(user.companyId);

  const { taskId } = await params;
  const canManageTasks = hasUserPermission(user, "tasks:manage");
  const companyWide = canSeeAllCompanyData(user.role.code);
  const assigneeFilter =
    user.role.code === "FOREMAN"
      ? { role: { code: { notIn: ["DEVELOPER" as const, "MANAGER" as const] } } }
      : companyWide
        ? {}
        : { departmentId: user.departmentId ?? undefined };

  const [task, assignees, departments, projects] = await Promise.all([
    prisma.task.findFirst({
      where: { id: taskId, ...taskScopeFor(user) },
      include: {
        assignee: { select: { name: true, email: true } },
        creator: { select: { name: true, email: true } },
        project: { select: { name: true } },
        department: { select: { name: true } },
        comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
        checklist: { include: { owner: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
        history: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } }
      }
    }),
    canManageTasks
      ? prisma.user.findMany({
          where: { companyId: user.companyId, isActive: true, ...assigneeFilter },
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
                  OR: [{ members: { some: { userId: user.id } } }, { tasks: { some: { departmentId: user.departmentId } } }]
                })
          },
          select: { id: true, name: true },
          orderBy: { name: "asc" }
        })
      : []
  ]);

  if (!task) {
    notFound();
  }

  if (task.assigneeId === user.id && task.status === "NEW") {
    await prisma.$transaction([
      prisma.task.update({
        where: { id: task.id },
        data: { status: "IN_PROGRESS" }
      }),
      prisma.taskHistory.create({
        data: {
          taskId: task.id,
          userId: user.id,
          field: "status",
          oldValue: "NEW",
          newValue: "IN_PROGRESS"
        }
      })
    ]);

    task.status = "IN_PROGRESS";
  }

  const doneItems = task.checklist.filter((item) => item.done).length;

  return (
    <div className="space-y-6">
      <Link href="/app/tasks" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-text">
        <ArrowLeft size={16} />К задачам
      </Link>

      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{task.description ?? "Описание не заполнено"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{statusLabels[task.status]}</Badge>
          <Badge variant={priorityVariant(task.priority)}>{priorityLabels[task.priority]}</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Статус задачи</h2>
              <Badge>{statusLabels[task.status]}</Badge>
            </div>
            <TaskStatusQuickActions taskId={task.id} status={task.status} />
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Чеклист</h2>
              <span className="text-sm text-muted">
                {doneItems}/{task.checklist.length}
              </span>
            </div>
            <div className="mb-4">
              <ChecklistForm taskId={task.id} />
            </div>
            <div className="space-y-2">
              {task.checklist.length === 0 && <p className="text-sm text-muted">Пока нет пунктов.</p>}
              {task.checklist.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-md bg-surface p-3">
                  <ChecklistToggle taskId={task.id} itemId={item.id} done={item.done} />
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${item.done ? "text-muted line-through" : ""}`}>{item.title}</div>
                    <div className="mt-1 text-xs text-muted">{item.owner?.name ?? "Без ответственного"}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-base font-semibold">Комментарии</h2>
            <CommentForm taskId={task.id} />
            <div className="mt-5 space-y-3">
              {task.comments.length === 0 && <p className="text-sm text-muted">Комментариев пока нет.</p>}
              {task.comments.map((comment) => (
                <div key={comment.id} className="rounded-md bg-surface p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium">{comment.author.name}</div>
                    <div className="text-xs text-muted">{formatDate(comment.createdAt)}</div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{comment.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 text-base font-semibold">Параметры</h2>
            {canManageTasks && (
              <div className="mb-4 space-y-3">
                <TaskEditForm
                  task={{
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    assigneeId: task.assigneeId,
                    departmentId: task.departmentId,
                    projectId: task.projectId,
                    dueAt: task.dueAt?.toISOString() ?? null,
                    priority: task.priority,
                    status: task.status,
                    type: task.type
                  }}
                  assignees={assignees}
                  departments={departments}
                  projects={projects}
                />
                <TaskDeleteButton taskId={task.id} title={task.title} />
              </div>
            )}
            <dl className="space-y-3 text-sm">
              <Info label="Исполнитель" value={task.assignee?.name ?? "Не назначен"} />
              <Info label="Постановщик" value={task.creator.name} />
              <Info label="Отдел" value={task.department?.name ?? "Без отдела"} />
              <Info label="Проект" value={task.project?.name ?? "Без проекта"} />
              <Info label="Срок" value={formatDate(task.dueAt)} />
              <Info label="Создана" value={formatDate(task.createdAt)} />
            </dl>
          </Card>

          <Card>
            <h2 className="mb-4 text-base font-semibold">История</h2>
            <div className="space-y-3">
              {task.history.length === 0 && <p className="text-sm text-muted">История пока пустая.</p>}
              {task.history.map((event) => (
                <div key={event.id} className="rounded-md bg-surface p-3">
                  <div className="text-sm font-medium">{event.field}</div>
                  <div className="mt-1 text-xs text-muted">
                    {event.user?.name ?? "Система"} · {formatDate(event.createdAt)}
                  </div>
                  <div className="mt-2 text-xs text-muted">
                    {event.oldValue ?? "пусто"} → {event.newValue ?? "пусто"}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stroke/60 pb-3 last:border-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
