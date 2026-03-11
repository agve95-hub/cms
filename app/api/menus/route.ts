import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET() {
  return NextResponse.json(db.select().from(schema.navigationMenus).all());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const { name, items } = await req.json();
  const existing = db.select().from(schema.navigationMenus).where(eq(schema.navigationMenus.name, name)).get();

  if (existing) {
    db.update(schema.navigationMenus)
      .set({ items: JSON.stringify(items), updatedAt: new Date().toISOString() })
      .where(eq(schema.navigationMenus.id, existing.id)).run();
    return NextResponse.json({ id: existing.id });
  }

  const id = uuid();
  db.insert(schema.navigationMenus).values({ id, name, items: JSON.stringify(items) }).run();
  return NextResponse.json({ id }, { status: 201 });
}
