import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageEditor } from "@/components/admin/PageEditor";

interface Props { params: { id: string } }

export default function EditPagePage({ params }: Props) {
  const page = db.select().from(schema.pages).where(eq(schema.pages.id, params.id)).get();
  if (!page) notFound();

  return <PageEditor page={page} />;
}
