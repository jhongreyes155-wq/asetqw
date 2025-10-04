
import { db } from "./db";
import { labs, type Lab, type InsertLab } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export const storage = {
  // Lab operations
  async getAllLabs(): Promise<Lab[]> {
    return await db.select().from(labs).orderBy(desc(labs.submittedAt));
  },

  async getLabById(id: number): Promise<Lab | undefined> {
    const result = await db.select().from(labs).where(eq(labs.id, id));
    return result[0];
  },

  async getLabsByStatus(status: string): Promise<Lab[]> {
    return await db.select().from(labs).where(eq(labs.status, status)).orderBy(desc(labs.submittedAt));
  },

  async createLab(lab: Omit<InsertLab, 'id' | 'submittedAt' | 'reviewedAt'>): Promise<Lab> {
    const result = await db.insert(labs).values({
      ...lab,
      status: "pending",
    }).returning();
    return result[0];
  },

  async updateLabStatus(
    id: number,
    status: string,
    reviewerNotes?: string,
    rejectionReason?: string
  ): Promise<Lab | undefined> {
    const result = await db
      .update(labs)
      .set({
        status,
        reviewedAt: new Date(),
        reviewerNotes,
        rejectionReason,
      })
      .where(eq(labs.id, id))
      .returning();
    return result[0];
  },

  async updateLab(id: number, data: Partial<InsertLab>): Promise<Lab | undefined> {
    const result = await db
      .update(labs)
      .set(data)
      .where(eq(labs.id, id))
      .returning();
    return result[0];
  },

  async deleteLab(id: number): Promise<void> {
    await db.delete(labs).where(eq(labs.id, id));
  },

  async getLabStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const allLabs = await this.getAllLabs();
    return {
      total: allLabs.length,
      pending: allLabs.filter(lab => lab.status === "pending").length,
      approved: allLabs.filter(lab => lab.status === "approved").length,
      rejected: allLabs.filter(lab => lab.status === "rejected").length,
    };
  },
};
