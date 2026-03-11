import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { createBackup } from "@/lib/backup/manager";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const backupFile = createBackup();
  if (!backupFile) return NextResponse.json({ error: { code: "BACKUP_FAILED" } }, { status: 500 });

  return NextResponse.json({ success: true, file: backupFile });
}
