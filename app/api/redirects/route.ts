import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  return NextResponse.json(db.select().from(schema.redirects).orderBy(desc(schema.redirects.createdAt)).all());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const { sourcePath, destination, type } = await req.json();
  const id = uuid();

  db.insert(schema.redirects).values({
    id, sourcePath, destination, type: type || 301,
    createdBy: (session.user as Record<string, string>).id,
  }).run();

  return NextResponse.json({ id }, { status: 201 });
}
