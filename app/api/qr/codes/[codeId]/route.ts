import { NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const qrDeleteRoles: RoleCode[] = ["DEVELOPER", "MANAGER"];

export async function DELETE(_request: Request, context: { params: Promise<{ codeId: string }> }) {
  const user = await requireUser();
  if (!qrDeleteRoles.includes(user.role.code)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { codeId } = await context.params;
  const code = await prisma.productQrCode.findFirst({
    where: { id: codeId, companyId: user.companyId },
    select: { id: true, productNumber: true, productName: true }
  });

  if (!code) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.productQrCode.delete({
    where: { id: code.id }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "qr_code_deleted",
      entity: "product_qr_code",
      entityId: code.id,
      meta: { productNumber: code.productNumber, productName: code.productName }
    }
  });

  return NextResponse.json({ ok: true });
}
