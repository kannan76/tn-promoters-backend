import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, updateLeadSchema, insertMeetingSchema } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

  // Leads
  app.get("/api/leads", async (req, res) => {
    res.json(await storage.getLeads());
  });

  app.get("/api/leads/:id", async (req, res) => {
    const lead = await storage.getLead(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  });

  app.post("/api/leads", async (req, res) => {
    const data = insertLeadSchema.parse(req.body);
    const lead = await storage.createLead(data);
    res.status(201).json(lead);
  });

  app.patch("/api/leads/:id", async (req, res) => {
    const data = updateLeadSchema.parse(req.body);
    const lead = await storage.updateLead(req.params.id, data);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  });

  app.delete("/api/leads/:id", async (req, res) => {
    await storage.deleteLead(req.params.id);
    res.status(204).send();
  });

  // Meetings
  app.get("/api/meetings", async (req, res) => {
    res.json(await storage.getMeetings());
  });

  app.get("/api/meetings/:id", async (req, res) => {
    const meeting = await storage.getMeeting(req.params.id);
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });
    res.json(meeting);
  });

  app.post("/api/meetings", async (req, res) => {
    const data = insertMeetingSchema.parse(req.body);
    const meeting = await storage.createMeeting(data);
    res.status(201).json(meeting);
  });

  app.patch("/api/meetings/:id/status", async (req, res) => {
    const meeting = await storage.updateMeetingStatus(req.params.id, req.body.status);
    res.json(meeting);
  });

  app.delete("/api/meetings/:id", async (req, res) => {
    await storage.deleteMeeting(req.params.id);
    res.status(204).send();
  });

  // Stats
  app.get("/api/stats", async (req, res) => {
    res.json(await storage.getDashboardStats());
  });

  const httpServer = createServer(app);
  return httpServer;
}
