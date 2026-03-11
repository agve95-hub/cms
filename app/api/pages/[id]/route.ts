import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { commitAndPush } from "@/lib/github/sync";
import { indexContent } from "@/lib/search/fts";
import { writeFileSync, mkdirSync, unlinkSync } from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const page = db.select().from(schema.pages).where(eq(schema.pages.id, params.id)).get();
  if (!page) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });

  return NextResponse.json(page);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();
  const existing = db.select().from(schema.pages).where(eq(schema.pages.id, params.id)).get();
  if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });

  // Auto-create redirect if slug changed
  if (body.slug && body.slug !== existing.slug) {
    db.insert(schema.redirects).values({
      id: uuid(),
      sourcePath: `/${existing.slug}`,
      destination: `/${body.slug}`,
      type: 301,
      createdBy: (session.user as Record<string, string>).id,
    }).run();
  }

  db.update(schema.pages).set({ ...body, updatedAt: now }).where(eq(schema.pages.id, params.id)).run();

  // Reindex
  if (body.blocks) {
    const parsedBlocks = JSON.parse(body.blocks);
    const textContent = parsedBlocks.map((b: Record<string, unknown>) => JSON.stringify(b.data)).join(" ");
    indexContent("page", params.id, body.title || existing.title, textContent);
  }

  // Activity log
  db.insert(schema.activityLog).values({
    id: uuid(),
    userId: (session.user as Record<string, string>).id,
    action: "update",
    entityType: "page",
    entityId: params.id,
    entityTitle: body.title || existing.title,
  }).run();

  // Git commit
  const slug = body.slug || existing.slug;
  const contentDir = path.join("content", "pages");
  mkdirSync(contentDir, { recursive: true });
  const updated = db.select().from(schema.pages).where(eq(schema.pages.id, params.id)).get();
  writeFileSync(path.join(contentDir, `${slug.replace(/\//g, "__")}.json`), JSON.stringify(updated, null, 2));
  await commitAndPush(`Update page: ${body.title || existing.title}`);

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const existing = db.select().from(schema.pages).where(eq(schema.pages.id, params.id)).get();
  if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });

  // Soft delete
  db.update(schema.pages)
    .set({ status: "trashed", updatedAt: new Date().toISOString() })
    .where(eq(schema.pages.id, params.id))
    .run();

  db.insert(schema.activityLog).values({
    id: uuid(),
    userId: (session.user as Record<string, string>).id,
    action: "delete",
    entityType: "page",
    entityId: params.id,
    entityTitle: existing.title,
  }).run();

  return NextResponse.json({ success: true });
}
