import { execSync } from "child_process";
import path from "path";
import { existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import logger from "@/lib/logger";

const BACKUP_PATH = process.env.BACKUP_PATH || "./backups";

export const createBackup = (): string | null => {
  try {
    if (!existsSync(BACKUP_PATH)) mkdirSync(BACKUP_PATH, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dbSource = process.env.DATABASE_PATH || "./data/cms.db";
    const backupFile = path.join(BACKUP_PATH, `backup-${timestamp}.db`);

    // Use SQLite .backup for consistency
    execSync(`sqlite3 ${dbSource} ".backup '${backupFile}'"`, { stdio: "pipe" });

    logger.info({ backupFile }, "Backup created");
    rotateBackups();
    return backupFile;
  } catch (error) {
    logger.error({ error }, "Backup failed");
    return null;
  }
};

const rotateBackups = () => {
  const maxDaily = Number(process.env.BACKUP_RETENTION_DAILY) || 7;

  if (!existsSync(BACKUP_PATH)) return;

  const files = readdirSync(BACKUP_PATH)
    .filter((f) => f.startsWith("backup-") && f.endsWith(".db"))
    .sort()
    .reverse();

  // Keep only the most recent N backups
  for (const file of files.slice(maxDaily)) {
    unlinkSync(path.join(BACKUP_PATH, file));
    logger.debug({ file }, "Rotated old backup");
  }
};
