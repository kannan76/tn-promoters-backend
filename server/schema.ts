import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  phone: varchar("phone"),
  source: varchar("source"),
  status: varchar("status"),
  created_at: timestamp("created_at").defaultNow()
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  leadId: varchar("leadId").references(() => leads.id),
  date: timestamp("date"),
  notes: text("notes")
});
