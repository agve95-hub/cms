import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { acquireLock, releaseLock, renewLock } from "@/lib/locks/content-lock";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const { action, entityType, entityId } = await req.json();
  const userId = (session.user as Record<string, string>).id;

  if (action === "acquire") {
    const result = acquireLock(entityType, entityId, userId);
    return NextResponse.json(result);
  }
  if (action === "release") {
    releaseLock(entityType, entityId, userId);
    return NextResponse.json({ success: true });
  }
  if (action === "renew") {
    renewLock(entityType, entityId, userId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: { code: "INVALID_ACTION" } }, { status: 400 });
}
