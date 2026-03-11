import { db, schema } from "@/lib/db";
import { and, eq, gt } from "drizzle-orm";
import { v4 as uuid } from "uuid";

const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const acquireLock = (entityType: string, entityId: string, userId: string) => {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS).toISOString();

  // Check existing lock
  const existing = db
    .select()
    .from(schema.contentLocks)
    .where(
      and(
        eq(schema.contentLocks.entityType, entityType),
        eq(schema.contentLocks.entityId, entityId),
        gt(schema.contentLocks.expiresAt, now)
      )
    )
    .get();

  if (existing && existing.userId !== userId) {
    return { locked: true, lockedBy: existing.userId, expiresAt: existing.expiresAt };
  }

  // Upsert lock
  if (existing) {
    db.update(schema.contentLocks)
      .set({ expiresAt, lockedAt: now })
      .where(eq(schema.contentLocks.id, existing.id))
      .run();
  } else {
    db.insert(schema.contentLocks)
      .values({ id: uuid(), entityType, entityId, userId, expiresAt })
      .run();
  }

  return { locked: false };
};

export const releaseLock = (entityType: string, entityId: string, userId: string) => {
  db.delete(schema.contentLocks)
    .where(
      and(
        eq(schema.contentLocks.entityType, entityType),
        eq(schema.contentLocks.entityId, entityId),
        eq(schema.contentLocks.userId, userId)
      )
    )
    .run();
};

export const renewLock = (entityType: string, entityId: string, userId: string) => {
  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
  db.update(schema.contentLocks)
    .set({ expiresAt })
    .where(
      and(
        eq(schema.contentLocks.entityType, entityType),
        eq(schema.contentLocks.entityId, entityId),
        eq(schema.contentLocks.userId, userId)
      )
    )
    .run();
};
