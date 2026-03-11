import { db, schema } from "@/lib/db";
import { v4 as uuid } from "uuid";
import type { NewsletterAdapter } from "./adapter";

export class DatabaseNewsletterAdapter implements NewsletterAdapter {
  async subscribe(email: string, metadata?: Record<string, string>): Promise<void> {
    await db.insert(schema.formSubmissions).values({
      id: uuid(),
      formName: "newsletter",
      data: JSON.stringify({ email, ...metadata }),
    }).run();
  }

  async unsubscribe(_email: string): Promise<void> {
    // In DB mode, subscriptions are just form submissions
    // Unsubscribe is a no-op — handled manually
  }
}
