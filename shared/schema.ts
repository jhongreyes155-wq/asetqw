
import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const labs = pgTable("labs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  estimatedTime: integer("estimated_time").notNull(),
  authorName: text("author_name").notNull(),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewerNotes: text("reviewer_notes"),
  rejectionReason: text("rejection_reason"),
});

export const insertLabSchema = createInsertSchema(labs).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
});

export const selectLabSchema = createSelectSchema(labs);

export type Lab = typeof labs.$inferSelect;
export type InsertLab = typeof labs.$inferInsert;
