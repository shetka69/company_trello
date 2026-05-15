import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(200)
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!hasUserPermission(user, "qr:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const name = parsed.data.name.trim();

  try {
    const preset = await prisma.qrProductPreset.create({
      data: {
        companyId: user.companyId,
        name
      }
    });

    await prisma.activityLog.create({
      data: {
        companyId: user.companyId,
        actorId: user.id,
        action: "qr_preset_created",
        entity: "qr_preset",
        entityId: preset.id,
        meta: { name }
      }
    });

    return NextResponse.json({ preset }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Preset already exists" }, { status: 409 });
  }
}
