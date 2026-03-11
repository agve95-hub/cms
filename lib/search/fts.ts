import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DATABASE_PATH || "./data/cms.db";

export const initFTS = () => {
  const sqlite = new Database(path.resolve(DB_PATH));

  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      entity_type,
      entity_id,
      title,
      content,
      tokenize='porter unicode61'
    );
  `);

  sqlite.close();
};

export const searchContent = (query: string, limit = 20) => {
  const sqlite = new Database(path.resolve(DB_PATH));

  try {
    const sanitized = query.replace(/['"]/g, "").trim();
    if (!sanitized) return [];

    const results = sqlite
      .prepare(
        `SELECT entity_type, entity_id, title,
                snippet(search_index, 3, '<mark>', '</mark>', '...', 32) as snippet,
                rank
         FROM search_index
         WHERE search_index MATCH ?
         ORDER BY rank
         LIMIT ?`
      )
      .all(sanitized, limit);

    return results;
  } finally {
    sqlite.close();
  }
};

export const indexContent = (entityType: string, entityId: string, title: string, content: string) => {
  const sqlite = new Database(path.resolve(DB_PATH));

  try {
    sqlite.prepare("DELETE FROM search_index WHERE entity_type = ? AND entity_id = ?").run(entityType, entityId);
    sqlite.prepare("INSERT INTO search_index (entity_type, entity_id, title, content) VALUES (?, ?, ?, ?)").run(
      entityType,
      entityId,
      title,
      content.replace(/<[^>]*>/g, "")
    );
  } finally {
    sqlite.close();
  }
};
