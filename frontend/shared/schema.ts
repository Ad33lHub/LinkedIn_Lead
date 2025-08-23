import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  // email: text("email"),
  // phone: text("phone"),
  linkedinUrl: text("linkedin_url").notNull(),
  apolloData: jsonb("apollo_data"),
  extractedAt: timestamp("extracted_at").defaultNow().notNull(),
});

export const extractions = pgTable("extractions", {
  id: serial("id").primaryKey(),
  jobTitle: text("job_title"),
  location: text("location"),
  industry: text("industry"),
  limit: integer("limit").notNull(),
  startPage: integer("start_page").default(1),
  endPage: integer("end_page").default(3),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  progress: integer("progress").default(0),
  totalLeads: integer("total_leads").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  exportFormat: text("export_format").default("csv"), // csv, excel
  autoSave: boolean("auto_save").default(true),
  showNotifications: boolean("show_notifications").default(true),
  theme: text("theme").default("light"), // light, dark, auto
  rememberCredentials: boolean("remember_credentials").default(false),
  lastEmail: text("last_email"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  extractedAt: true,
});

export const insertExtractionSchema = createInsertSchema(extractions).omit({
  id: true,
  status: true,
  progress: true,
  totalLeads: true,
  createdAt: true,
  completedAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Extraction = typeof extractions.$inferSelect;
export type InsertExtraction = z.infer<typeof insertExtractionSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
