import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["EVENT", "REMINDER"]),
  title: z.string().min(2).max(200),
  description: z.string().nullable().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  assigneeId: z.string().nullable().optional()
});

export async function POST(request: Request) {
  const user = await requireUser();
  const canManageCalendar = hasUserPermission(user, "calendar:manage");

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!canManageCalendar && parsed.data.type !== "REMINDER") {
    return NextResponse.json({ error: "Only private reminders are allowed" }, { status: 403 });
  }

  const assigneeId = canManageCalendar ? parsed.data.assigneeId || null : user.id;

  if (assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: { id: assigneeId, companyId: user.companyId, isActive: true },
      select: { id: true }
    });

    if (!assignee) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
  }

  const event = await prisma.calendarEvent.create({
    data: {
      companyId: user.companyId,
      creatorId: user.id,
      assigneeId,
      type: canManageCalendar ? parsed.data.type : "REMINDER",
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "calendar_event_created",
      entity: "calendar_event",
      entityId: event.id,
      meta: { title: event.title, type: event.type }
    }
  });

  return NextResponse.json({ event }, { status: 201 });
}
