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

// Chat conversations table
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title"), // Auto-generated from first message
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: serial("conversation_id").notNull().references(() => chatConversations.id),
  role: varchar("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  model: varchar("model"), // AI model used
  usage: jsonb("usage"), // Token usage info
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Knowledge base table for storing extracted info
export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'project_link', 'info', 'note', etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // Additional data like URLs, tags, etc.
  sourceConversationId: serial("source_conversation_id").references(() => chatConversations.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type KnowledgeItem = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeItem = typeof knowledgeBase.$inferInsert;
