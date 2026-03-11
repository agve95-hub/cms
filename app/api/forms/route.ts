import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { sendEmail } from "@/lib/email/send";
import { sanitizePlainText } from "@/lib/security/sanitize";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  const submissions = db.select().from(schema.formSubmissions).orderBy(desc(schema.formSubmissions.createdAt)).all();
  return NextResponse.json(submissions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { formName, data, pageId } = body;

  // Honeypot check
  if (data?._hp) return NextResponse.json({ success: true });

  const sanitizedData: Record<string, string> = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (key.startsWith("_")) continue;
    sanitizedData[key] = sanitizePlainText(String(value));
  }

  const id = uuid();
  db.insert(schema.formSubmissions).values({
    id,
    formName: formName || "contact",
    data: JSON.stringify(sanitizedData),
    pageId,
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  }).run();

  // Send email notification
  if (process.env.CONTACT_FORM_TO) {
    const fields = Object.entries(sanitizedData).map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`).join("");
    await sendEmail({
      to: process.env.CONTACT_FORM_TO,
      subject: `New ${formName || "contact"} form submission`,
      html: `<h2>New Form Submission</h2>${fields}<p><em>From page: ${pageId || "unknown"}</em></p>`,
    });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
