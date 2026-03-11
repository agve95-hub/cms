import { db, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export const findRedirect = (path: string) => {
  const redirect = db
    .select()
    .from(schema.redirects)
    .where(eq(schema.redirects.sourcePath, path))
    .get();

  if (redirect) {
    // Increment hit counter
    db.update(schema.redirects)
      .set({ hits: sql`${schema.redirects.hits} + 1` })
      .where(eq(schema.redirects.id, redirect.id))
      .run();
  }

  return redirect;
};
