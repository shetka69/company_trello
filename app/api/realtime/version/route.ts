import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getRealtimeVersion } from "@/lib/realtime-version";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const user = await requireUser();
  const payload = await getRealtimeVersion(user);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    }
  });
}
