import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createQrSvg, publicQrUrl } from "@/lib/qr";

const schema = z.object({
  productNumber: z.string().min(1).max(120),
  productName: z.string().min(2).max(200),
  manufacturedAt: z.string().datetime(),
  recipient: z.string().min(2).max(200),
  destination: z.string().min(2).max(300),
  shippingDueAt: z.string().datetime()
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

  const productNumber = parsed.data.productNumber.trim();
  const existing = await prisma.productQrCode.findFirst({
    where: {
      companyId: user.companyId,
      productNumber
    },
    select: { id: true }
  });

  if (existing) {
    return NextResponse.json({ error: "Product number already exists" }, { status: 409 });
  }

  const token = randomBytes(18).toString("base64url");
  const origin = new URL(request.url).origin;
  const qrPayload = publicQrUrl(origin, token);
  const qrSvg = await createQrSvg(qrPayload, productNumber);

  const code = await prisma.productQrCode.create({
    data: {
      companyId: user.companyId,
      createdById: user.id,
      createdByNameSnapshot: user.name,
      token,
      productNumber,
      productName: parsed.data.productName.trim(),
      manufacturedAt: new Date(parsed.data.manufacturedAt),
      recipient: parsed.data.recipient.trim(),
      destination: parsed.data.destination.trim(),
      shippingDueAt: new Date(parsed.data.shippingDueAt),
      qrPayload,
      qrSvg
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "qr_code_created",
      entity: "product_qr_code",
      entityId: code.id,
      meta: { productNumber: code.productNumber, productName: code.productName }
    }
  });

  return NextResponse.json({ code }, { status: 201 });
}
