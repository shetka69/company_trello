import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
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
  const canManageCalendar = hasUserPermission(user, "calendar:manage");

  const { eventId } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const event = await prisma.calendarEvent.findFirst({
    where: { id: eventId, companyId: user.companyId },
    select: { id: true, title: true, type: true, creatorId: true, assigneeId: true }
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canEditOwnReminder = event.type === "REMINDER" && (event.creatorId === user.id || event.assigneeId === user.id);
  if (!canManageCalendar && !canEditOwnReminder) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!canManageCalendar && parsed.data.type && parsed.data.type !== "REMINDER") {
    return NextResponse.json({ error: "Only private reminders are allowed" }, { status: 403 });
  }

  const assigneeId = canManageCalendar ? parsed.data.assigneeId : user.id;

  if (assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: { id: assigneeId, companyId: user.companyId, isActive: true },
      select: { id: true }
    });

    if (!assignee) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
  }

  const updated = await prisma.calendarEvent.update({
    where: { id: event.id },
    data: {
      assigneeId,
      type: canManageCalendar ? parsed.data.type : "REMINDER",
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
  const canManageCalendar = hasUserPermission(user, "calendar:manage");

  const { eventId } = await context.params;
  const event = await prisma.calendarEvent.findFirst({
    where: { id: eventId, companyId: user.companyId },
    select: { id: true, title: true, companyId: true, type: true, creatorId: true, assigneeId: true }
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canDeleteOwnReminder = event.type === "REMINDER" && (event.creatorId === user.id || event.assigneeId === user.id);
  if (!canManageCalendar && !canDeleteOwnReminder) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
