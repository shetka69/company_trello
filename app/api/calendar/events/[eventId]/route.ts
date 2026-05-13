import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["EVENT", "REMINDER"]).optional(),
  title: z.string().min(2).max(200).optional(),
  description: z.string().nullable().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  assigneeId: z.string().nullable().optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ eventId: string }> }) {
  const user = await requireUser();
  if (!hasPermission(user.role.code, "calendar:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { eventId } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const event = await prisma.calendarEvent.findFirst({
    where: { id: eventId, companyId: user.companyId },
    select: { id: true, title: true }
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: { id: parsed.data.assigneeId, companyId: user.companyId, isActive: true },
      select: { id: true }
    });

    if (!assignee) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
  }

  const updated = await prisma.calendarEvent.update({
    where: { id: event.id },
    data: {
      assigneeId: parsed.data.assigneeId,
      type: parsed.data.type,
      title: parsed.data.title?.trim(),
      description: parsed.data.description === undefined ? undefined : parsed.data.description?.trim() || null,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      endsAt: parsed.data.endsAt === undefined ? undefined : parsed.data.endsAt ? new Date(parsed.data.endsAt) : null
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "calendar_event_updated",
      entity: "calendar_event",
      entityId: event.id,
      meta: { from: event.title, to: updated.title }
    }
  });

  return NextResponse.json({ event: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ eventId: string }> }) {
  const user = await requireUser();
  if (!hasPermission(user.role.code, "calendar:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { eventId } = await context.params;
  const event = await prisma.calendarEvent.findFirst({
    where: { id: eventId, companyId: user.companyId },
    select: { id: true, title: true, companyId: true }
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.activityLog.create({
      data: {
        companyId: event.companyId,
        actorId: user.id,
        action: "calendar_event_deleted",
        entity: "calendar_event",
        entityId: event.id,
        meta: { title: event.title }
      }
    }),
    prisma.calendarEvent.delete({ where: { id: event.id } })
  ]);

  return NextResponse.json({ ok: true });
}
