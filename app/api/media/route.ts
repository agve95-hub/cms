import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { processImage } from "@/lib/media/process";
import { validateUpload } from "@/lib/security/validate-upload";
import { indexContent } from "@/lib/search/fts";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const allMedia = db.select().from(schema.media).orderBy(desc(schema.media.createdAt)).all();
  return NextResponse.json(allMedia);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const altText = formData.get("altText") as string || "";

  if (!file) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "No file provided" } }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const validation = await validateUpload(buffer, file.type, file.size);
  if (!validation.valid) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: validation.error } }, { status: 400 });
  }

  const processed = await processImage(buffer, file.name);
  const id = uuid();

  db.insert(schema.media).values({
    id,
    filename: file.name,
    filepath: processed.original,
    mimetype: file.type,
    sizeBytes: file.size,
    width: processed.width,
    height: processed.height,
    altText,
    variants: JSON.stringify(processed.variants),
    uploadedBy: (session.user as Record<string, string>).id,
  }).run();

  indexContent("media", id, file.name, altText);

  db.insert(schema.activityLog).values({
    id: uuid(), userId: (session.user as Record<string, string>).id,
    action: "create", entityType: "media", entityId: id, entityTitle: file.name,
  }).run();

  return NextResponse.json({ id, filename: file.name, filepath: processed.original }, { status: 201 });
}
