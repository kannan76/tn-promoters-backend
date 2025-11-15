import { type Lead, type InsertLead, type UpdateLead, type Meeting, type InsertMeeting, type DashboardStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: UpdateLead): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;

  // Meetings
  getMeetings(): Promise<Meeting[]>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeetingStatus(id: string, status: string): Promise<Meeting | undefined>;
  deleteMeeting(id: string): Promise<boolean>;

  // Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private leads: Map<string, Lead>;
  private meetings: Map<string, Meeting>;

  constructor() {
    this.leads = new Map();
    this.meetings = new Map();
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const now = new Date();
    const lead: Lead = {
      ...insertLead,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: string, updateData: UpdateLead): Promise<Lead | undefined> {
    const existing = this.leads.get(id);
    if (!existing) return undefined;

    const updated: Lead = {
      ...existing,
      ...updateData,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };
    this.leads.set(id, updated);
    return updated;
  }

  async deleteLead(id: string): Promise<boolean> {
    // Delete associated meetings
    const meetingsToDelete = Array.from(this.meetings.values())
      .filter((m) => m.leadId === id)
      .map((m) => m.id);
    meetingsToDelete.forEach((mid) => this.meetings.delete(mid));

    return this.leads.delete(id);
  }

  // Meetings
  async getMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = randomUUID();
    const meeting: Meeting = {
      ...insertMeeting,
      id,
      createdAt: new Date(),
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeetingStatus(id: string, status: string): Promise<Meeting | undefined> {
    const existing = this.meetings.get(id);
    if (!existing) return undefined;

    const updated: Meeting = {
      ...existing,
      status,
    };
    this.meetings.set(id, updated);
    return updated;
  }

  async deleteMeeting(id: string): Promise<boolean> {
    return this.meetings.delete(id);
  }

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const allLeads = Array.from(this.leads.values());
    const allMeetings = Array.from(this.meetings.values());

    // Count leads by status
    const leadsByStatus = allLeads.reduce((acc, lead) => {
      const existing = acc.find((item) => item.status === lead.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status: lead.status, count: 1 });
      }
      return acc;
    }, [] as { status: string; count: number }[]);

    // Count meetings today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const meetingsToday = allMeetings.filter((meeting) => {
      const meetingDate = new Date(meeting.dateTime);
      return meetingDate >= today && meetingDate < tomorrow;
    }).length;

    // Monthly leads for the last 6 months
    const monthlyLeads: { month: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString("default", { month: "short" });
      const count = allLeads.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return (
          leadDate.getMonth() === date.getMonth() &&
          leadDate.getFullYear() === date.getFullYear()
        );
      }).length;
      monthlyLeads.push({ month: monthKey, count });
    }

    return {
      totalLeads: allLeads.length,
      leadsByStatus,
      meetingsToday,
      monthlyLeads,
    };
  }
}

export const storage = new MemStorage();
