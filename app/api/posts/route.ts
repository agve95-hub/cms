import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { eq, desc, ne } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { sanitizeHtml } from "@/lib/security/sanitize";
import { indexContent } from "@/lib/search/fts";
import { commitAndPush } from "@/lib/github/sync";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

const postSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  blocks: z.string(),
  excerpt: z.string().max(500).nullable().optional(),
  featuredImage: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived", "trashed"]).optional(),
  publishAt: z.string().nullable().optional(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  seoOgImage: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  robots: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const allPosts = status
    ? db.select().from(schema.posts).where(eq(schema.posts.status, status)).orderBy(desc(schema.posts.updatedAt)).all()
    : db.select().from(schema.posts).where(ne(schema.posts.status, "trashed")).orderBy(desc(schema.posts.updatedAt)).all();

  return NextResponse.json(allPosts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", details: parsed.error.issues } }, { status: 400 });
  }

  const { title, slug, blocks, categories, tags, ...rest } = parsed.data;
  const id = uuid();
  const now = new Date().toISOString();

  db.insert(schema.posts).values({
    id,
    title: sanitizeHtml(title),
    slug,
    blocks,
    createdBy: (session.user as Record<string, string>).id,
    createdAt: now,
    updatedAt: now,
    ...rest,
  }).run();

  // Handle categories
  if (categories) {
    for (const catId of categories) {
      db.insert(schema.postCategories).values({ postId: id, categoryId: catId }).run();
    }
  }

  // Handle tags
  if (tags) {
    for (const tagId of tags) {
      db.insert(schema.postTags).values({ postId: id, tagId }).run();
    }
  }

  // Index for search
  const parsedBlocks = JSON.parse(blocks);
  const textContent = parsedBlocks.map((b: Record<string, unknown>) => JSON.stringify(b.data)).join(" ");
  indexContent("post", id, title, textContent);

  // Activity log
  db.insert(schema.activityLog).values({
    id: uuid(), userId: (session.user as Record<string, string>).id,
    action: "create", entityType: "post", entityId: id, entityTitle: title,
  }).run();

  // Git commit
  const contentDir = path.join("content", "posts");
  mkdirSync(contentDir, { recursive: true });
  writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify({ id, title, slug, blocks, ...rest }, null, 2));
  await commitAndPush(`Create post: ${title}`);

  return NextResponse.json({ id, title, slug }, { status: 201 });
}
