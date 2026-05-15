import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!hasUserPermission(user, "qr:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const value = url.searchParams.get("value")?.trim();
  if (!value) {
    return NextResponse.json({ error: "value is required" }, { status: 400 });
  }

  const token = extractToken(value);
  const code = await prisma.productQrCode.findFirst({
    where: {
      companyId: user.companyId,
      OR: [{ token: token ?? value }, { productNumber: value }]
    },
    select: { token: true }
  });

  if (!code) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ href: `/qr/${code.token}` });
}

function extractToken(value: string) {
  try {
    const url = new URL(value);
    const match = url.pathname.match(/^\/qr\/([a-zA-Z0-9_-]+)$/);
    return match?.[1] ?? null;
  } catch {
    const match = value.match(/^\/?qr\/([a-zA-Z0-9_-]+)$/);
    return match?.[1] ?? null;
  }
}
