
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLabSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all labs
  app.get("/api/labs", async (_req, res) => {
    try {
      const labs = await storage.getAllLabs();
      res.json(labs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get labs by status
  app.get("/api/labs/status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      const labs = await storage.getLabsByStatus(status);
      res.json(labs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get lab stats
  app.get("/api/labs/stats", async (_req, res) => {
    try {
      const stats = await storage.getLabStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single lab
  app.get("/api/labs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lab = await storage.getLabById(id);
      if (!lab) {
        return res.status(404).json({ message: "Lab not found" });
      }
      res.json(lab);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create lab
  app.post("/api/labs", async (req, res) => {
    try {
      const result = insertLabSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid lab data", errors: result.error });
      }
      const lab = await storage.createLab(result.data);
      res.status(201).json(lab);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update lab
  app.patch("/api/labs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lab = await storage.updateLab(id, req.body);
      if (!lab) {
        return res.status(404).json({ message: "Lab not found" });
      }
      res.json(lab);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Review lab (approve/reject)
  app.post("/api/labs/:id/review", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, reviewerNotes, rejectionReason } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      const lab = await storage.updateLabStatus(id, status, reviewerNotes, rejectionReason);
      if (!lab) {
        return res.status(404).json({ message: "Lab not found" });
      }
      res.json(lab);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete lab
  app.delete("/api/labs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLab(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
