import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { inventoryScopeFor, taskScopeFor } from "@/lib/data-scope";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const scope = searchParams.get("scope");

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const contains = { contains: query, mode: "insensitive" as const };
  const includeTasks = !scope || scope === "tasks";
  const includeAll = !scope;

  const [tasks, items, users, projects, qrCodes] = await Promise.all([
    includeTasks && hasUserPermission(user, "tasks:read")
      ? prisma.task.findMany({
          where: {
            AND: [taskScopeFor(user), { OR: [{ title: contains }, { description: contains }] }]
          },
          select: { id: true, title: true, status: true },
          take: 6,
          orderBy: { updatedAt: "desc" }
        })
      : [],
    includeAll && hasUserPermission(user, "inventory:read")
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
    includeAll && hasUserPermission(user, "users:manage")
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
    includeAll
      ? prisma.project.findMany({
          where: {
            companyId: user.companyId,
            OR: [{ name: contains }, { description: contains }]
          },
          select: { id: true, name: true, description: true },
          take: 5,
          orderBy: { updatedAt: "desc" }
        })
      : [],
    includeAll && hasUserPermission(user, "qr:read")
      ? prisma.productQrCode.findMany({
          where: {
            companyId: user.companyId,
            OR: [{ productNumber: contains }, { productName: contains }]
          },
          select: { id: true, productNumber: true, productName: true, status: true },
          take: 6,
          orderBy: { updatedAt: "desc" }
        })
      : []
  ]);

  const results = [
    ...tasks.map((task) => ({
      id: `task-${task.id}`,
      kind: "task",
      type: "Задача",
      title: task.title,
      subtitle: task.status,
      href: `/app/tasks/${task.id}`
    })),
    ...items.map((item) => ({
      id: `inventory-${item.id}`,
      kind: "inventory",
      type: "Склад",
      title: item.name,
      subtitle: `${item.category} · ${item.quantity} ${item.unit}`,
      href: "/app/inventory"
    })),
    ...users.map((employee) => ({
      id: `user-${employee.id}`,
      kind: "user",
      type: "Сотрудник",
      title: employee.name,
      subtitle: employee.email,
      href: "/app/settings"
    })),
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      kind: "project",
      type: "Проект",
      title: project.name,
      subtitle: project.description ?? "Проект",
      href: "/app/tasks"
    })),
    ...qrCodes.map((code) => ({
      id: `qr-${code.id}`,
      kind: "qr",
      type: "QR-код",
      title: code.productName,
      subtitle: `Номер: ${code.productNumber} · ${code.status}`,
      href: "/app/qr"
    }))
  ];

  return NextResponse.json({ results });
}
