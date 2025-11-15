import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { storage } from "./storage.js";

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Leads
app.get("/api/leads", async (_, res) => {
  res.json(await storage.getLeads());
});

app.get("/api/leads/:id", async (req, res) => {
  const lead = await storage.getLead(req.params.id);
  if (!lead) return res.status(404).json({ error: "Not found" });
  res.json(lead);
});

app.post("/api/leads", async (req, res) => {
  const lead = await storage.createLead(req.body);
  res.status(201).json(lead);
});

app.patch("/api/leads/:id", async (req, res) => {
  const updated = await storage.updateLead(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

app.delete("/api/leads/:id", async (req, res) => {
  const ok = await storage.deleteLead(req.params.id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

// Meetings
app.get("/api/meetings", async (_, res) => {
  res.json(await storage.getMeetings());
});

app.post("/api/meetings", async (req, res) => {
  const meeting = await storage.createMeeting(req.body);
  res.status(201).json(meeting);
});

app.patch("/api/meetings/:id/status", async (req, res) => {
  const updated = await storage.updateMeetingStatus(req.params.id, req.body.status);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

app.delete("/api/meetings/:id", async (req, res) => {
  const ok = await storage.deleteMeeting(req.params.id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

// Stats
app.get("/api/stats", async (_, res) => {
  res.json(await storage.getStats());
});

// Start server
createServer(app).listen(PORT, () => {
  console.log("Server running on port", PORT);
});
