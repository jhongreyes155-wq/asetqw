import { db } from "./db";
import {
  users,
  labs,
  auditLog,
  chatConversations,
  chatMessages,
  knowledgeBase,
  type User,
  type UpsertUser,
  type Lab,
  type InsertLab,
  type AuditLog,
  type InsertAuditLog,
  type ChatConversation,
  type InsertChatConversation,
  type ChatMessage,
  type InsertChatMessage,
  type KnowledgeItem,
  type InsertKnowledgeItem,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByRole(role: string): Promise<User[]>;
  
  // Lab operations
  getAllLabs(): Promise<Lab[]>;
  getLabById(id: number): Promise<Lab | undefined>;
  getLabsByStatus(status: string): Promise<Lab[]>;
  getLabsByAuthor(authorId: string): Promise<Lab[]>;
  createLab(lab: InsertLab): Promise<Lab>;
  updateLab(id: number, data: Partial<Lab>): Promise<Lab | undefined>;
  updateLabStatus(
    id: number,
    status: string,
    reviewComment?: string
  ): Promise<Lab | undefined>;
  deleteLab(id: number): Promise<void>;
  
  // Audit log operations
  createAuditLog(log: Omit<InsertAuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;
  getLabAuditHistory(labId: number): Promise<AuditLog[]>;

  // Chat operations
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getUserConversations(userId: string): Promise<ChatConversation[]>;
  getConversationById(id: number): Promise<ChatConversation | undefined>;
  updateConversationTitle(id: number, title: string): Promise<ChatConversation | undefined>;
  
  // Chat message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getConversationMessages(conversationId: number): Promise<ChatMessage[]>;
  
  // Knowledge base operations
  createKnowledgeItem(item: InsertKnowledgeItem): Promise<KnowledgeItem>;
  getUserKnowledgeItems(userId: string): Promise<KnowledgeItem[]>;
  getKnowledgeItemById(id: number): Promise<KnowledgeItem | undefined>;
  updateKnowledgeItem(id: number, data: Partial<KnowledgeItem>): Promise<KnowledgeItem | undefined>;
  deleteKnowledgeItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Lab operations
  async getAllLabs(): Promise<Lab[]> {
    return await db.select().from(labs).orderBy(desc(labs.createdAt));
  }

  async getLabById(id: number): Promise<Lab | undefined> {
    const [lab] = await db.select().from(labs).where(eq(labs.id, id));
    return lab;
  }

  async getLabsByStatus(status: string): Promise<Lab[]> {
    return await db
      .select()
      .from(labs)
      .where(eq(labs.status, status))
      .orderBy(desc(labs.createdAt));
  }

  async getLabsByAuthor(authorId: string): Promise<Lab[]> {
    return await db
      .select()
      .from(labs)
      .where(eq(labs.authorId, authorId))
      .orderBy(desc(labs.createdAt));
  }

  async createLab(labData: InsertLab): Promise<Lab> {
    const [lab] = await db.insert(labs).values(labData).returning();
    return lab;
  }

  async updateLab(id: number, data: Partial<Lab>): Promise<Lab | undefined> {
    const [lab] = await db
      .update(labs)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(labs.id, id))
      .returning();
    return lab;
  }

  async updateLabStatus(
    id: number,
    status: string,
    reviewComment?: string
  ): Promise<Lab | undefined> {
    const [lab] = await db
      .update(labs)
      .set({
        status,
        reviewComment,
        updatedAt: new Date(),
      })
      .where(eq(labs.id, id))
      .returning();
    return lab;
  }

  async deleteLab(id: number): Promise<void> {
    await db.delete(labs).where(eq(labs.id, id));
  }

  // Audit log operations
  async createAuditLog(logData: Omit<InsertAuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const [log] = await db.insert(auditLog).values(logData).returning();
    return log;
  }

  async getLabAuditHistory(labId: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.labId, labId))
      .orderBy(desc(auditLog.timestamp));
  }

  // Chat operations
  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db.insert(chatConversations).values(conversation).returning();
    return newConversation;
  }

  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    return await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.updatedAt));
  }

  async getConversationById(id: number): Promise<ChatConversation | undefined> {
    const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
    return conversation;
  }

  async updateConversationTitle(id: number, title: string): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .update(chatConversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(chatConversations.id, id))
      .returning();
    return conversation;
  }

  // Chat message operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getConversationMessages(conversationId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);
  }

  // Knowledge base operations
  async createKnowledgeItem(item: InsertKnowledgeItem): Promise<KnowledgeItem> {
    const [newItem] = await db.insert(knowledgeBase).values(item).returning();
    return newItem;
  }

  async getUserKnowledgeItems(userId: string): Promise<KnowledgeItem[]> {
    return await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.userId, userId))
      .orderBy(desc(knowledgeBase.createdAt));
  }

  async getKnowledgeItemById(id: number): Promise<KnowledgeItem | undefined> {
    const [item] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
    return item;
  }

  async updateKnowledgeItem(id: number, data: Partial<KnowledgeItem>): Promise<KnowledgeItem | undefined> {
    const [item] = await db
      .update(knowledgeBase)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(knowledgeBase.id, id))
      .returning();
    return item;
  }

  async deleteKnowledgeItem(id: number): Promise<void> {
    await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
  }
}

export const storage = new DatabaseStorage();
