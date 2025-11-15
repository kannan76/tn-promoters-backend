import { db } from "./db";
import { leads, meetings } from "./schema";
import { eq } from "drizzle-orm";

export const storage = {
  // Leads
  getLeads: () => db.select().from(leads),

  getLead: (id: string) =>
    db.select().from(leads).where(eq(leads.id, Number(id))).then(r => r[0]),

  createLead: (data: any) =>
    db.insert(leads).values(data).returning(),

  updateLead: (id: string, data: any) =>
    db.update(leads).set(data).where(eq(leads.id, Number(id))).returning().then(r => r[0]),

  deleteLead: (id: string) =>
    db.delete(leads).where(eq(leads.id, Number(id))).then(() => true),

  // Meetings
  getMeetings: () => db.select().from(meetings),

  getMeeting: (id: string) =>
    db.select().from(meetings).where(eq(meetings.id, Number(id))).then(r => r[0]),

  createMeeting: (data: any) =>
    db.insert(meetings).values(data).returning(),

  updateMeetingStatus: (id: string, status: string) =>
    db.update(meetings).set({ status }).where(eq(meetings.id, Number(id))).returning().then(r => r[0]),

  deleteMeeting: (id: string) =>
    db.delete(meetings).where(eq(meetings.id, Number(id))).then(() => true),

  // Dashboard stats
  getDashboardStats: async () => {
    const totalLeads = (await db.select().from(leads)).length;
    const totalMeetings = (await db.select().from(meetings)).length;
    return {
      totalLeads,
      totalMeetings
    };
  }
};
