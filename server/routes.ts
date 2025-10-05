import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, isAuthor } from "./replitAuth";
import { createLabSchema } from "@shared/schema";
import { z } from "zod";
import express from "express";
import admin from "firebase-admin";
import OpenAI from 'openai';
import { AI_COMMANDERS, type CommanderType } from "../shared/ai-commanders.js";
import { externalAPI } from './externalAPI.js';

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

  // Stripe checkout
  app.post('/api/create-checkout-session', isAuthenticated, async (req: any, res) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const uid = req.user.claims.sub;
    const { plan } = req.body;
    if (!['basic', 'pro'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });

    const priceId = process.env[`STRIPE_PRICE_${plan.toUpperCase()}`];
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: req.user.claims.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.protocol}://${req.get('host')}/?success=1`,
      cancel_url: `${req.protocol}://${req.get('host')}/?cancel=1`,
    });

    res.json({ sessionId: session.id });
  });

  // Stripe webhook
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req: any, res) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const customer = await stripe.customers.retrieve(event.data.object.customer);
      const email = customer.email;
      const user = await admin.auth().getUserByEmail(email);
      const uid = user.uid;

      await admin.firestore().collection('subscriptions').doc(uid).set({
        plan: event.data.object.metadata?.plan || 'basic',
        stripeCustomerId: event.data.object.customer,
        status: event.data.object.status,
        currentPeriodEnd: event.data.object.current_period_end,
      });

      await admin.auth().setCustomUserClaims(uid, { plan: event.data.object.metadata?.plan || 'basic' });
    }

    if (event.type === 'customer.subscription.deleted') {
      const customer = await stripe.customers.retrieve(event.data.object.customer);
      const email = customer.email;
      const uid = (await admin.auth().getUserByEmail(email)).uid;

      await admin.firestore().collection('subscriptions').doc(uid).delete();
      await admin.auth().setCustomUserClaims(uid, { plan: 'free' });
    }

    res.json({ received: true });
  });

  // Get chat conversations
  app.get('/api/chat/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  // Get conversation messages
  app.get('/api/chat/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const conversation = await storage.getConversationById(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Get knowledge base
  app.get('/api/knowledge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const knowledgeItems = await storage.getUserKnowledgeItems(userId);
      res.json(knowledgeItems);
    } catch (error: any) {
      console.error('Error fetching knowledge base:', error);
      res.status(500).json({ error: 'Failed to fetch knowledge base' });
    }
  });

  // Get lab context for AI
  app.get('/api/labs/context', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const labs = await storage.getLabsByAuthor(userId);
      
      // Format lab context for AI consumption
      const labContext = labs.map(lab => ({
        id: lab.id,
        title: lab.title,
        description: lab.description,
        difficulty: lab.difficulty,
        tags: lab.tags,
        status: lab.status,
        createdAt: lab.createdAt,
        // Include recent activity or other relevant data
      }));

      res.json({
        labs: labContext,
        totalCount: labs.length,
        summary: {
          total: labs.length,
          draft: labs.filter(l => l.status === 'draft').length,
          pending: labs.filter(l => l.status === 'pending').length,
          approved: labs.filter(l => l.status === 'approved').length,
          rejected: labs.filter(l => l.status === 'rejected').length,
        }
      });
    } catch (error: any) {
      console.error('Error fetching lab context:', error);
      res.status(500).json({ error: 'Failed to fetch lab context' });
    }
  });

  // AI Chat endpoint
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, model = 'gpt-3.5-turbo', conversationId, commander } = req.body;
      const userId = req.user.claims.sub;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversationById(conversationId);
        if (!conversation || conversation.userId !== userId) {
          return res.status(404).json({ error: 'Conversation not found' });
        }
      } else {
        // Create new conversation
        const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
        conversation = await storage.createChatConversation({
          userId,
          title,
        });
      }

      // Get user's labs and knowledge for context
      const userLabs = await storage.getLabsByAuthor(userId);
      const knowledgeItems = await storage.getUserKnowledgeItems(userId);
      
      // Build enhanced system prompt with user context and commander expertise
      const labContext = userLabs.length > 0 
        ? `\n\nUser's Labs:\n${userLabs.map(lab => `- ${lab.title}: ${lab.description.substring(0, 100)}...`).join('\n')}`
        : '';
      
      const knowledgeContext = knowledgeItems.length > 0
        ? `\n\nUser's Knowledge Base:\n${knowledgeItems.map(item => `- ${item.title}: ${item.content.substring(0, 100)}...`).join('\n')}`
        : '';

      // Base system prompt
      let systemPrompt = 'You are a helpful assistant for a cosmic discovery lab management platform. Help users with scientific questions, lab management, and general assistance.';

      // Add commander-specific expertise if selected
      if (commander && AI_COMMANDERS[commander as CommanderType]) {
        systemPrompt = AI_COMMANDERS[commander as CommanderType].systemPrompt;
      }

      systemPrompt += `\n\nYou have access to the user's lab information and knowledge base. Use this context to provide more personalized and relevant assistance.${labContext}${knowledgeContext}

When users mention projects, labs, or ask to remember information, suggest storing it in their knowledge base. If they provide links or important information, offer to save it for future reference.`;

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Get conversation history for context
      const previousMessages = conversationId ? await storage.getConversationMessages(conversation.id) : [];
      
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...previousMessages.slice(-10).map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
        { role: 'user', content: message }
      ];

      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      // Store the conversation messages
      await storage.createChatMessage({
        conversationId: conversation.id,
        role: 'user',
        content: message,
      });

      await storage.createChatMessage({
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
        model,
        usage: completion.usage,
      });

      // Enhanced knowledge extraction from the conversation
      const knowledgePatterns = [
        // Remember this patterns
        /(?:remember|store|save)\s+(?:this|that|it|the\s+following)[\s:]+(.+?)(?:\n|$)/i,
        /(?:note|important)[\s:]+(.+?)(?:\n|$)/i,
        /(?:key|crucial|essential)\s+(?:point|info|information)[\s:]+(.+?)(?:\n|$)/i,
        
        // Project links and URLs
        /(?:project|lab|repo|repository)\s+(?:link|url)[\s:]+(https?:\/\/[^\s]+)/i,
        /(?:check\s+out|see|visit)\s+(?:this|my|the)\s+(?:project|lab|repo)[\s:]+(https?:\/\/[^\s]+)/i,
        /(?:github|gitlab|bitbucket)[\s:]+(https?:\/\/[^\s]+)/i,
        
        // Resource and documentation links
        /(?:documentation|docs|guide|tutorial)[\s:]+(https?:\/\/[^\s]+)/i,
        /(?:api|endpoint|service)\s+(?:docs|documentation)[\s:]+(https?:\/\/[^\s]+)/i,
        
        // Contact and social links
        /(?:contact|email|linkedin|twitter|discord|slack)[\s:]+([^\s\n]+)/i,
        
        // Technical references
        /(?:npm|pypi|maven|gradle)\s+package[\s:]+([^\s\n]+)/i,
        /(?:docker|aws|gcp|azure)\s+(?:image|service|resource)[\s:]+([^\s\n]+)/i,
      ];

      // Extract and categorize knowledge
      const extractedKnowledge = [];
      
      for (const pattern of knowledgePatterns) {
        const matches = message.match(new RegExp(pattern, 'gi'));
        if (matches) {
          for (const match of matches) {
            const capture = match.match(pattern);
            if (capture && capture[1]) {
              let content = capture[1].trim();
              let type = 'info';
              let title = content;

              // Determine type and clean content
              if (content.match(/^https?:\/\//)) {
                type = 'project_link';
                // Try to extract title from URL or use domain
                const url = new URL(content);
                title = `${url.hostname} ${url.pathname.substring(1, 50)}`.trim();
              } else if (pattern.source.includes('remember|store|save')) {
                type = 'note';
              } else if (pattern.source.includes('contact|email|linkedin|twitter|discord|slack')) {
                type = 'contact';
              } else if (pattern.source.includes('npm|pypi|maven|gradle|docker|aws|gcp|azure')) {
                type = 'technical_resource';
              }

              // Clean up title
              if (title.length > 100) {
                title = title.substring(0, 97) + '...';
              }

              extractedKnowledge.push({
                type,
                title,
                content,
                metadata: { 
                  source: 'chat_extraction', 
                  commander: commander || 'general',
                  conversationId: conversation.id,
                  pattern: pattern.source.substring(0, 50)
                }
              });
            }
          }
        }
      }

      // Store extracted knowledge
      for (const item of extractedKnowledge) {
        await storage.createKnowledgeItem({
          userId,
          type: item.type,
          title: item.title,
          content: item.content,
          metadata: item.metadata,
          sourceConversationId: conversation.id,
        });
      }

      // Check for API commands and execute them
      const command = externalAPI.parseCommand(message);
      let commandResult: any = null;

      if (command) {
        try {
          commandResult = await externalAPI.executeCommand(command);
          
          // Add command execution to knowledge base
          await storage.createKnowledgeItem({
            userId,
            type: 'api_command',
            title: `Executed ${command.service} ${command.action}`,
            content: `Command: ${JSON.stringify(command)}\nResult: ${JSON.stringify(commandResult)}`,
            metadata: { 
              source: 'command_execution', 
              commander: commander || 'general',
              conversationId: conversation.id,
              service: command.service,
              action: command.action
            },
            sourceConversationId: conversation.id,
          });
        } catch (error: any) {
          console.error('Command execution error:', error);
          commandResult = { success: false, error: error.message };
        }
      }

      // Update conversation timestamp
      await storage.updateConversationTitle(conversation.id, conversation.title || 'Updated Conversation');

      res.json({
        reply,
        conversationId: conversation.id,
        model,
        usage: completion.usage,
        conversationTitle: conversation.title,
      });
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      res.status(500).json({
        error: 'Failed to get AI response',
        details: error.message,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
