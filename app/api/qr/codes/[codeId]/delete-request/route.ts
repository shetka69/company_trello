import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ codeId: string }> }) {
  const user = await requireUser();
  const { codeId } = await context.params;

  const code = await prisma.productQrCode.findFirst({
    where: { id: codeId, companyId: user.companyId },
    select: { id: true, token: true, productNumber: true, productName: true }
  });

  if (!code) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const approvers = await prisma.user.findMany({
    where: {
      companyId: user.companyId,
      isActive: true,
      role: { code: { in: ["DEVELOPER", "MANAGER"] } }
    },
    select: { id: true }
  });

  await Promise.all(
    approvers.map((approver) =>
      createNotification({
        companyId: user.companyId,
        userId: approver.id,
        title: "Запрос на удаление QR-кода",
        body: `${user.name} просит удалить QR-код изделия ${code.productNumber} (${code.productName}).`,
        priority: "IMPORTANT",
        meta: {
          reason: "qr_delete_request",
          qrCodeId: code.id,
          token: code.token,
          productNumber: code.productNumber,
          productName: code.productName,
          requestedById: user.id,
          requestedByName: user.name
        }
      })
    )
  );

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "qr_code_delete_requested",
      entity: "product_qr_code",
      entityId: code.id,
      meta: { productNumber: code.productNumber, productName: code.productName }
    }
  });

  return NextResponse.json({ ok: true });
}
