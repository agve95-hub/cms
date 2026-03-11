import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { commitAndPush } from "@/lib/github/sync";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const post = db.select().from(schema.posts).where(eq(schema.posts.id, params.id)).get();
  if (!post) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });

  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();
  const existing = db.select().from(schema.posts).where(eq(schema.posts.id, params.id)).get();
  if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });

  if (body.slug && body.slug !== existing.slug) {
    db.insert(schema.redirects).values({
      id: uuid(), sourcePath: `/blog/${existing.slug}`, destination: `/blog/${body.slug}`, type: 301,
      createdBy: (session.user as Record<string, string>).id,
    }).run();
  }

  db.update(schema.posts).set({ ...body, updatedAt: now }).where(eq(schema.posts.id, params.id)).run();

  db.insert(schema.activityLog).values({
    id: uuid(), userId: (session.user as Record<string, string>).id,
    action: "update", entityType: "post", entityId: params.id, entityTitle: body.title || existing.title,
  }).run();

  const slug = body.slug || existing.slug;
  const contentDir = path.join("content", "posts");
  mkdirSync(contentDir, { recursive: true });
  const updated = db.select().from(schema.posts).where(eq(schema.posts.id, params.id)).get();
  writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(updated, null, 2));
  await commitAndPush(`Update post: ${body.title || existing.title}`);

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const existing = db.select().from(schema.posts).where(eq(schema.posts.id, params.id)).get();
  if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });

  db.update(schema.posts).set({ status: "trashed", updatedAt: new Date().toISOString() }).where(eq(schema.posts.id, params.id)).run();

  db.insert(schema.activityLog).values({
    id: uuid(), userId: (session.user as Record<string, string>).id,
    action: "delete", entityType: "post", entityId: params.id, entityTitle: existing.title,
  }).run();

  return NextResponse.json({ success: true });
}
