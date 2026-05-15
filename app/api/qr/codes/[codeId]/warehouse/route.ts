import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: Request, context: { params: Promise<{ codeId: string }> }) {
  const user = await requireUser();
  if (!hasUserPermission(user, "qr:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { codeId } = await context.params;
  const code = await prisma.productQrCode.findFirst({
    where: { id: codeId, companyId: user.companyId },
    select: { id: true, productNumber: true, status: true }
  });

  if (!code) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (code.status === "SHIPPED") {
    return NextResponse.json({ error: "Already shipped" }, { status: 409 });
  }

  const updated = await prisma.productQrCode.update({
    where: { id: code.id },
    data: { status: "WAREHOUSE" },
    select: { id: true, status: true }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "qr_code_warehouse",
      entity: "product_qr_code",
      entityId: code.id,
      meta: { productNumber: code.productNumber }
    }
  });

  return NextResponse.json({ code: updated });
}
