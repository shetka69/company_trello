import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { inventoryScopeFor, taskScopeFor } from "@/lib/data-scope";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const contains = { contains: query, mode: "insensitive" as const };
  const [tasks, items, users, projects] = await Promise.all([
    hasPermission(user.role.code, "tasks:read")
      ? prisma.task.findMany({
          where: {
            ...taskScopeFor(user),
            OR: [{ title: contains }, { description: contains }]
          },
          select: { id: true, title: true, status: true },
          take: 5,
          orderBy: { updatedAt: "desc" }
        })
      : [],
    hasPermission(user.role.code, "inventory:read")
      ? prisma.inventoryItem.findMany({
          where: {
            ...inventoryScopeFor(user),
            OR: [{ name: contains }, { category: contains }, { comments: contains }]
          },
          select: { id: true, name: true, category: true, quantity: true, unit: true },
          take: 5,
          orderBy: { updatedAt: "desc" }
        })
      : [],
    hasPermission(user.role.code, "users:manage")
      ? prisma.user.findMany({
          where: {
            companyId: user.companyId,
            OR: [{ name: contains }, { email: contains }]
          },
          select: { id: true, name: true, email: true },
          take: 5,
          orderBy: { name: "asc" }
        })
      : [],
    prisma.project.findMany({
      where: {
        companyId: user.companyId,
        OR: [{ name: contains }, { description: contains }]
      },
      select: { id: true, name: true, description: true },
      take: 5,
      orderBy: { updatedAt: "desc" }
    })
  ]);

  const results = [
    ...tasks.map((task) => ({
      id: `task-${task.id}`,
      type: "Задача",
      title: task.title,
      subtitle: task.status,
      href: `/app/tasks/${task.id}`
    })),
    ...items.map((item) => ({
      id: `inventory-${item.id}`,
      type: "Склад",
      title: item.name,
      subtitle: `${item.category} · ${item.quantity} ${item.unit}`,
      href: "/app/inventory"
    })),
    ...users.map((employee) => ({
      id: `user-${employee.id}`,
      type: "Сотрудник",
      title: employee.name,
      subtitle: employee.email,
      href: "/app/settings"
    })),
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      type: "Проект",
      title: project.name,
      subtitle: project.description ?? "Проект",
      href: "/app/tasks"
    }))
  ];

  return NextResponse.json({ results });
}
