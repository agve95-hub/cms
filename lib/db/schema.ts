import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const timestamp = (name: string) =>
  text(name).default(sql`(datetime('now'))`);

// ─── Users ──────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
  avatarUrl: text("avatar_url"),
  oauthProvider: text("oauth_provider"),
  oauthId: text("oauth_id"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── Pages ──────────────────────────────────────────
export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: text("parent_id").references(() => pages.id),
  template: text("template"),
  blocks: text("blocks").notNull().default("[]"),
  status: text("status", {
    enum: ["draft", "published", "archived", "trashed"],
  }).notNull().default("draft"),
  publishAt: text("publish_at"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoOgImage: text("seo_og_image"),
  canonicalUrl: text("canonical_url"),
  robots: text("robots").default("index,follow"),
  autoSaveBlocks: text("auto_save_blocks"),
  autoSaveAt: text("auto_save_at"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── Posts ──────────────────────────────────────────
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  blocks: text("blocks").notNull().default("[]"),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image").references(() => media.id),
  status: text("status", {
    enum: ["draft", "published", "archived", "trashed"],
  }).notNull().default("draft"),
  publishAt: text("publish_at"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoOgImage: text("seo_og_image"),
  canonicalUrl: text("canonical_url"),
  robots: text("robots").default("index,follow"),
  autoSaveBlocks: text("auto_save_blocks"),
  autoSaveAt: text("auto_save_at"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── Categories ─────────────────────────────────────
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

// ─── Tags ───────────────────────────────────────────
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

// ─── Post ↔ Category junction ──────────────────────
export const postCategories = sqliteTable("post_categories", {
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
});

// ─── Post ↔ Tag junction ───────────────────────────
export const postTags = sqliteTable("post_tags", {
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
});

// ─── Media ──────────────────────────────────────────
export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  mimetype: text("mimetype").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  variants: text("variants"),
  uploadedBy: text("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── Navigation Menus ──────────────────────────────
export const navigationMenus = sqliteTable("navigation_menus", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  items: text("items").notNull().default("[]"),
  updatedAt: timestamp("updated_at"),
});

// ─── Form Submissions ──────────────────────────────
export const formSubmissions = sqliteTable("form_submissions", {
  id: text("id").primaryKey(),
  formName: text("form_name").notNull(),
  data: text("data").notNull(),
  pageId: text("page_id"),
  ipAddress: text("ip_address"),
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── Activity Log ──────────────────────────────────
export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  entityTitle: text("entity_title"),
  details: text("details"),
  createdAt: timestamp("created_at"),
});

// ─── Site Settings ─────────────────────────────────
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ─── Redirects ─────────────────────────────────────
export const redirects = sqliteTable("redirects", {
  id: text("id").primaryKey(),
  sourcePath: text("source_path").notNull().unique(),
  destination: text("destination").notNull(),
  type: integer("type").notNull().default(301),
  hits: integer("hits").notNull().default(0),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── Content Locks ─────────────────────────────────
export const contentLocks = sqliteTable("content_locks", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  lockedAt: timestamp("locked_at"),
  expiresAt: text("expires_at").notNull(),
});

// ─── Import Jobs ───────────────────────────────────
export const importJobs = sqliteTable("import_jobs", {
  id: text("id").primaryKey(),
  source: text("source", { enum: ["wordpress", "github"] }).notNull(),
  status: text("status", {
    enum: ["pending", "processing", "completed", "failed"],
  }).notNull().default("pending"),
  filePath: text("file_path"),
  summary: text("summary"),
  startedBy: text("started_by").references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: text("completed_at"),
});

// ─── Login Attempts ────────────────────────────────
export const loginAttempts = sqliteTable("login_attempts", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  success: integer("success", { mode: "boolean" }).notNull(),
  createdAt: timestamp("created_at"),
  lockoutUntil: text("lockout_until"),
});
