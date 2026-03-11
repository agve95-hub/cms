import cron from "node-cron";
import { db, schema } from "@/lib/db";
import { eq, lt, and, lte } from "drizzle-orm";
import { commitAndPush } from "@/lib/github/sync";
import logger from "@/lib/logger";

export const startScheduler = () => {
  // Publish scheduled content — every minute
  cron.schedule("* * * * *", async () => {
    const now = new Date().toISOString();

    const duePages = db
      .select()
      .from(schema.pages)
      .where(and(eq(schema.pages.status, "draft"), lte(schema.pages.publishAt, now)))
      .all()
      .filter((p) => p.publishAt);

    for (const page of duePages) {
      db.update(schema.pages)
        .set({ status: "published", updatedAt: now })
        .where(eq(schema.pages.id, page.id))
        .run();
      logger.info({ pageId: page.id, title: page.title }, "Auto-published page");
      await commitAndPush(`Publish page: ${page.title}`);
    }

    const duePosts = db
      .select()
      .from(schema.posts)
      .where(and(eq(schema.posts.status, "draft"), lte(schema.posts.publishAt, now)))
      .all()
      .filter((p) => p.publishAt);

    for (const post of duePosts) {
      db.update(schema.posts)
        .set({ status: "published", updatedAt: now })
        .where(eq(schema.posts.id, post.id))
        .run();
      logger.info({ postId: post.id, title: post.title }, "Auto-published post");
      await commitAndPush(`Publish post: ${post.title}`);
    }
  });

  // Purge trash — daily 3 AM
  cron.schedule("0 3 * * *", () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    db.delete(schema.pages)
      .where(and(eq(schema.pages.status, "trashed"), lt(schema.pages.updatedAt, thirtyDaysAgo)))
      .run();

    db.delete(schema.posts)
      .where(and(eq(schema.posts.status, "trashed"), lt(schema.posts.updatedAt, thirtyDaysAgo)))
      .run();

    logger.info("Purged trashed content older than 30 days");
  });

  // Expire content locks — every 5 minutes
  cron.schedule("*/5 * * * *", () => {
    const now = new Date().toISOString();
    db.delete(schema.contentLocks).where(lt(schema.contentLocks.expiresAt, now)).run();
  });

  logger.info("Scheduler started");
};
