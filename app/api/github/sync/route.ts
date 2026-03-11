import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { commitAndPush } from "@/lib/github/sync";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const success = await commitAndPush("Manual sync from admin panel", ["content/"]);
  return NextResponse.json({ success });
}
