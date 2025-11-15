import { z } from "zod";

export const insertLeadSchema = z.object({
  name: z.string(),
  phone: z.string(),
  source: z.string(),
  status: z.string()
});

export const updateLeadSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional()
});

export const insertMeetingSchema = z.object({
  leadId: z.string(),
  date: z.string(),
  notes: z.string().optional()
});
