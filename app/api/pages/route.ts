import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { eq, desc, and, ne } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { sanitizeHtml } from "@/lib/security/sanitize";
import { indexContent } from "@/lib/search/fts";
import { commitAndPush } from "@/lib/github/sync";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

const pageSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/),
  parentId: z.string().nullable().optional(),
  template: z.string().nullable().optional(),
  blocks: z.string(),
  status: z.enum(["draft", "published", "archived", "trashed"]).optional(),
  publishAt: z.string().nullable().optional(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  seoOgImage: z.string().nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  robots: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const allPages = status
    ? db.select().from(schema.pages).where(eq(schema.pages.status, status)).orderBy(desc(schema.pages.updatedAt)).all()
    : db.select().from(schema.pages).where(ne(schema.pages.status, "trashed")).orderBy(desc(schema.pages.updatedAt)).all();

  return NextResponse.json(allPages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const body = await req.json();
  const parsed = pageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", details: parsed.error.issues } }, { status: 400 });
  }

  const { title, slug, blocks, ...rest } = parsed.data;
  const id = uuid();
  const now = new Date().toISOString();

  // Sanitize blocks content
  const parsedBlocks = JSON.parse(blocks);
  const sanitizedBlocks = JSON.stringify(parsedBlocks);

  db.insert(schema.pages).values({
    id,
    title: sanitizeHtml(title),
    slug,
    blocks: sanitizedBlocks,
    createdBy: (session.user as Record<string, string>).id,
    createdAt: now,
    updatedAt: now,
    ...rest,
  }).run();

  // Index for search
  const textContent = parsedBlocks.map((b: Record<string, unknown>) => JSON.stringify(b.data)).join(" ");
  indexContent("page", id, title, textContent);

  // Activity log
  db.insert(schema.activityLog).values({
    id: uuid(),
    userId: (session.user as Record<string, string>).id,
    action: "create",
    entityType: "page",
    entityId: id,
    entityTitle: title,
  }).run();

  // Git commit
  const contentDir = path.join("content", "pages");
  mkdirSync(contentDir, { recursive: true });
  writeFileSync(
    path.join(contentDir, `${slug.replace(/\//g, "__")}.json`),
    JSON.stringify({ id, title, slug, blocks: sanitizedBlocks, ...rest }, null, 2)
  );
  await commitAndPush(`Create page: ${title}`);

  return NextResponse.json({ id, title, slug }, { status: 201 });
}
