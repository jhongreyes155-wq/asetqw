import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, isAuthor } from "./replitAuth";
import { createLabSchema } from "@shared/schema";
import { z } from "zod";

async function sendDiscordNotification(message: string) {
  try {
    await fetch('https://discord.com/api/webhooks/1423976541343187016/9iYnct1P1J1IYBJIbBpeOE94UvSWkKhNrE7WefOFb6jarscMtm_k43gu_MUgOKjJrN-8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (process.env.NODE_ENV === "development" && userId === "dev-user") {
        return res.json({ id: "dev-user", email: "dev@example.com", firstName: "Dev", lastName: "User", role: "admin" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout route
  app.get('/api/logout', (req: any, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  // Lab routes for authors
  app.post('/api/labs', isAuthenticated, isAuthor, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const labData = createLabSchema.parse(req.body);
      
      const lab = await storage.createLab({
        ...labData,
        authorId: userId,
        status: "draft",
        reviewComment: null,
      });

      res.json(lab);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lab data", errors: error.errors });
      }
      console.error("Error creating lab:", error);
      res.status(500).json({ message: "Failed to create lab" });
    }
  });

  app.get('/api/labs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { status } = req.query;

      let labs;
      if (user?.role === "admin") {
        // Admins can see all labs
        labs = status ? await storage.getLabsByStatus(status as string) : await storage.getAllLabs();
      } else {
        // Authors only see their own labs
        labs = await storage.getLabsByAuthor(userId);
        if (status) {
          labs = labs.filter(lab => lab.status === status);
        }
      }

      res.json(labs);
    } catch (error) {
      console.error("Error fetching labs:", error);
      res.status(500).json({ message: "Failed to fetch labs" });
    }
  });

  app.get('/api/labs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const labId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const lab = await storage.getLabById(labId);
      
      if (!lab) {
        return res.status(404).json({ message: "Lab not found" });
      }

      // Check permissions: admin can see all, authors can only see their own
      if (user?.role !== "admin" && lab.authorId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(lab);
    } catch (error) {
      console.error("Error fetching lab:", error);
      res.status(500).json({ message: "Failed to fetch lab" });
    }
  });

  app.put('/api/labs/:id', isAuthenticated, isAuthor, async (req: any, res) => {
    try {
      const labId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const lab = await storage.getLabById(labId);
      
      if (!lab) {
        return res.status(404).json({ message: "Lab not found" });
      }

      // Authors can only edit their own labs
      if (lab.authorId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Can only edit drafts
      if (lab.status !== "draft") {
        return res.status(400).json({ message: "Can only edit draft labs" });
      }

      const updatedLab = await storage.updateLab(labId, req.body);
      res.json(updatedLab);
    } catch (error) {
      console.error("Error updating lab:", error);
      res.status(500).json({ message: "Failed to update lab" });
    }
  });

  app.post('/api/labs/:id/submit', isAuthenticated, isAuthor, async (req: any, res) => {
    try {
      const labId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const lab = await storage.getLabById(labId);
      
      if (!lab) {
        return res.status(404).json({ message: "Lab not found" });
      }

      if (lab.authorId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (lab.status !== "draft") {
        return res.status(400).json({ message: "Lab already submitted" });
      }

      const updatedLab = await storage.updateLabStatus(labId, "pending");
      
      // Create audit log
      await storage.createAuditLog({
        labId,
        actorId: userId,
        action: "submit",
        oldStatus: "draft",
        newStatus: "pending",
      });

      res.json(updatedLab);
    } catch (error) {
      console.error("Error submitting lab:", error);
      res.status(500).json({ message: "Failed to submit lab" });
    }
  });

  // Admin routes
  app.post('/api/labs/:id/approve', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const labId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { comment } = req.body;
      
      const lab = await storage.getLabById(labId);
      
      if (!lab) {
        return res.status(404).json({ message: "Lab not found" });
      }

      if (lab.status !== "pending") {
        return res.status(400).json({ message: "Can only approve pending labs" });
      }

      const updatedLab = await storage.updateLabStatus(labId, "approved", comment);
      
      // Create audit log
      await storage.createAuditLog({
        labId,
        actorId: userId,
        action: "approve",
        oldStatus: "pending",
        newStatus: "approved",
        comment,
      });

      // TODO: Send email notification to author

      sendDiscordNotification(`Lab "${lab.title}" has been approved.`);

      res.json(updatedLab);
    } catch (error) {
      console.error("Error approving lab:", error);
      res.status(500).json({ message: "Failed to approve lab" });
    }
  });

  app.post('/api/labs/:id/reject', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const labId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { comment } = req.body;
      
      const lab = await storage.getLabById(labId);
      
      if (!lab) {
        return res.status(404).json({ message: "Lab not found" });
      }

      if (lab.status !== "pending") {
        return res.status(400).json({ message: "Can only reject pending labs" });
      }

      const updatedLab = await storage.updateLabStatus(labId, "rejected", comment);
      
      // Create audit log
      await storage.createAuditLog({
        labId,
        actorId: userId,
        action: "reject",
        oldStatus: "pending",
        newStatus: "rejected",
        comment,
      });

      // TODO: Send email notification to author

      sendDiscordNotification(`Lab "${lab.title}" has been rejected. Comment: ${comment || 'No comment'}`);

      res.json(updatedLab);
    } catch (error) {
      console.error("Error rejecting lab:", error);
      res.status(500).json({ message: "Failed to reject lab" });
    }
  });

  app.get('/api/labs/:id/history', isAuthenticated, async (req: any, res) => {
    try {
      const labId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const lab = await storage.getLabById(labId);
      
      if (!lab) {
        return res.status(404).json({ message: "Lab not found" });
      }

      // Check permissions
      if (user?.role !== "admin" && lab.authorId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const history = await storage.getLabAuditHistory(labId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching lab history:", error);
      res.status(500).json({ message: "Failed to fetch lab history" });
    }
  });

  // Discord message sending
  app.post('/api/discord/send', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      await sendDiscordNotification(message);
      res.json({ status: 'sent' });
    } catch (error) {
      console.error("Error sending Discord message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
