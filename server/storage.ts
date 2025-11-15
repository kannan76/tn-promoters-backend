import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// -----------------------------------------------------------------------------
// FIX: Make data.json path work on Render & after esbuild bundling
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// data.json MUST be inside the SAME folder as storage.ts (server/)
const DATA_PATH = path.join(__dirname, "data.json");

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface Lead {
  id: string;
  name: string;
  phone: string;
  source?: string;
  status?: string;
  notes?: string;
  createdAt: string;
}

interface Meeting {
  id: string;
  leadId: string;
  date: string;
  status: string;
  notes?: string;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err: any) {

    // If file missing → create new default database
    if (err.code === "ENOENT") {
      const initial = { leads: [], meetings: [] };
      await writeData(initial);
      return initial;
    }

    throw err;
  }
}

async function writeData(data: any) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

// -----------------------------------------------------------------------------
// Storage API
// -----------------------------------------------------------------------------
export const storage = {
  async getLeads() {
    const data = await readData();
    return data.leads;
  },

  async getLead(id: string) {
    const data = await readData();
    return data.leads.find((l: Lead) => l.id === id);
  },

  async createLead(lead: any) {
    const data = await readData();
    const newLead = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...lead,
    };
    data.leads.push(newLead);
    await writeData(data);
    return newLead;
  },

  async updateLead(id: string, updates: any) {
    const data = await readData();
    const index = data.leads.findIndex((l: Lead) => l.id === id);
    if (index === -1) return null;

    data.leads[index] = { ...data.leads[index], ...updates };
    await writeData(data);
    return data.leads[index];
  },

  async deleteLead(id: string) {
    const data = await readData();
    const before = data.leads.length;
    data.leads = data.leads.filter((l: Lead) => l.id !== id);
    await writeData(data);
    return data.leads.length < before;
  },

  async getMeetings() {
    const data = await readData();
    return data.meetings;
  },

  async getMeeting(id: string) {
    const data = await readData();
    return data.meetings.find((m: Meeting) => m.id === id);
  },

  async createMeeting(meeting: any) {
    const data = await readData();
    const newMeeting = {
      id: Date.now().toString(),
      ...meeting,
    };
    data.meetings.push(newMeeting);
    await writeData(data);
    return newMeeting;
  },

  async updateMeetingStatus(id: string, status: string) {
    const data = await readData();
    const index = data.meetings.findIndex((m: Meeting) => m.id === id);
    if (index === -1) return null;

    data.meetings[index].status = status;
    await writeData(data);
    return data.meetings[index];
  },

  async deleteMeeting(id: string) {
    const data = await readData();
    const before = data.meetings.length;
    data.meetings = data.meetings.filter((m: Meeting) => m.id !== id);
    await writeData(data);
    return data.meetings.length < before;
  },

  async getStats() {
    const data = await readData();
    return {
      totalLeads: data.leads.length,
      totalMeetings: data.meetings.length,
    };
  }
};
