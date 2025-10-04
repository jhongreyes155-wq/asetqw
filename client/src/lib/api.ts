
import type { Lab, InsertLab } from "@shared/schema";

const API_BASE = "/api";

export const api = {
  // Get all labs
  getLabs: async (): Promise<Lab[]> => {
    const response = await fetch(`${API_BASE}/labs`);
    if (!response.ok) throw new Error("Failed to fetch labs");
    return response.json();
  },

  // Get labs by status
  getLabsByStatus: async (status: string): Promise<Lab[]> => {
    const response = await fetch(`${API_BASE}/labs?status=${status}`);
    if (!response.ok) throw new Error("Failed to fetch labs");
    return response.json();
  },

  // Get lab stats
  getLabStats: async (): Promise<{ total: number; pending: number; approved: number; rejected: number }> => {
    const response = await fetch(`${API_BASE}/labs/stats`);
    if (!response.ok) throw new Error("Failed to fetch stats");
    return response.json();
  },

  // Get single lab
  getLab: async (id: number): Promise<Lab> => {
    const response = await fetch(`${API_BASE}/labs/${id}`);
    if (!response.ok) throw new Error("Failed to fetch lab");
    return response.json();
  },

  // Create lab
  createLab: async (lab: Omit<InsertLab, "id" | "submittedAt" | "reviewedAt">): Promise<Lab> => {
    const response = await fetch(`${API_BASE}/labs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lab),
    });
    if (!response.ok) throw new Error("Failed to create lab");
    return response.json();
  },

  // Update lab
  updateLab: async (id: number, data: Partial<InsertLab>): Promise<Lab> => {
    const response = await fetch(`${API_BASE}/labs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update lab");
    return response.json();
  },

  // Review lab
  reviewLab: async (
    id: number,
    status: "approved" | "rejected",
    reviewerNotes?: string,
    rejectionReason?: string
  ): Promise<Lab> => {
    const response = await fetch(`${API_BASE}/labs/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewerNotes, rejectionReason }),
    });
    if (!response.ok) throw new Error("Failed to review lab");
    return response.json();
  },

  // Delete lab
  deleteLab: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/labs/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete lab");
  },

  // Submit lab for review
  submitLab: async (id: number): Promise<Lab> => {
    const response = await fetch(`${API_BASE}/labs/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to submit lab");
    return response.json();
  },

  // Approve lab (admin only)
  approveLab: async (id: number, comment?: string): Promise<Lab> => {
    const response = await fetch(`${API_BASE}/labs/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    if (!response.ok) throw new Error("Failed to approve lab");
    return response.json();
  },

  // Reject lab (admin only)
  rejectLab: async (id: number, comment: string): Promise<Lab> => {
    const response = await fetch(`${API_BASE}/labs/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    if (!response.ok) throw new Error("Failed to reject lab");
    return response.json();
  },

  // Get current user
  getCurrentUser: async (): Promise<any> => {
    const response = await fetch(`${API_BASE}/auth/user`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },
};
