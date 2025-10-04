import { db } from "./db";
import {
  users,
  labs,
  auditLog,
  type User,
  type UpsertUser,
  type Lab,
  type InsertLab,
  type AuditLog,
  type InsertAuditLog,
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
}

export const storage = new DatabaseStorage();
