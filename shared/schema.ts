import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("author"), // "admin" or "author"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Labs table
export const labs = pgTable("labs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty").notNull().default("beginner"), // beginner, intermediate, advanced
  tags: text("tags").array(),
  price: varchar("price").notNull().default("0"),
  authorId: varchar("author_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("draft"), // draft, pending, approved, rejected
  reviewComment: text("review_comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLabSchema = createInsertSchema(labs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createLabSchema = insertLabSchema.omit({
  authorId: true,
  status: true,
  reviewComment: true,
});

export type InsertLab = z.infer<typeof insertLabSchema>;
export type CreateLab = z.infer<typeof createLabSchema>;
export type Lab = typeof labs.$inferSelect;

// Audit log table for tracking status changes
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  labId: serial("lab_id").notNull().references(() => labs.id),
  actorId: varchar("actor_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // approve, reject, submit, reopen
  oldStatus: varchar("old_status"),
  newStatus: varchar("new_status").notNull(),
  comment: text("comment"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;
