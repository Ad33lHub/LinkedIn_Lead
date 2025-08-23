import { leads, extractions, settings, type Lead, type InsertLead, type Extraction, type InsertExtraction, type Settings, type InsertSettings } from "../shared/schema";

export interface IStorage {
  // Lead management
  getLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  createLeads(leads: InsertLead[]): Promise<Lead[]>;
  clearLeads(): Promise<void>;
  
  // Extraction management
  getExtractions(): Promise<Extraction[]>;
  getExtraction(id: number): Promise<Extraction | undefined>;
  createExtraction(extraction: InsertExtraction): Promise<Extraction>;
  updateExtraction(id: number, updates: Partial<Extraction>): Promise<Extraction | undefined>;
  
  // Settings management
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private leads: Map<number, Lead>;
  private extractions: Map<number, Extraction>;
  private settings: Settings;
  private currentLeadId: number;
  private currentExtractionId: number;

  constructor() {
    this.leads = new Map();
    this.extractions = new Map();
    this.currentLeadId = 1;
    this.currentExtractionId = 1;
    this.settings = {
      id: 1,
      exportFormat: "csv",
      autoSave: true,
      showNotifications: true,
      theme: "light",
      rememberCredentials: false,
      lastEmail: null,
    };
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => 
      new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime()
    );
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const lead: Lead = {
      ...insertLead,
      id,
      extractedAt: new Date(),
      // email: insertLead.email ?? null,
      // phone: insertLead.phone ?? null,
      apolloData: insertLead.apolloData ?? null,
    };
    this.leads.set(id, lead);
    return lead;
  }

  async createLeads(insertLeads: InsertLead[]): Promise<Lead[]> {
    const createdLeads: Lead[] = [];
    for (const insertLead of insertLeads) {
      const lead = await this.createLead(insertLead);
      createdLeads.push(lead);
    }
    return createdLeads;
  }

  async clearLeads(): Promise<void> {
    this.leads.clear();
  }

  async getExtractions(): Promise<Extraction[]> {
    return Array.from(this.extractions.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getExtraction(id: number): Promise<Extraction | undefined> {
    return this.extractions.get(id);
  }

  async createExtraction(insertExtraction: InsertExtraction): Promise<Extraction> {
    const id = this.currentExtractionId++;
    const extraction: Extraction = {
      ...insertExtraction,
      id,
      status: "pending",
      progress: null,
      totalLeads: null,
      createdAt: new Date(),
      completedAt: null,
      jobTitle: insertExtraction.jobTitle ?? null,
      location: insertExtraction.location ?? null,
      industry: insertExtraction.industry ?? null,
      startPage: insertExtraction.startPage ?? null,
      endPage: insertExtraction.endPage ?? null,
    };
    this.extractions.set(id, extraction);
    return extraction;
  }

  async updateExtraction(id: number, updates: Partial<Extraction>): Promise<Extraction | undefined> {
    const extraction = this.extractions.get(id);
    if (!extraction) return undefined;
    
    const updated = { ...extraction, ...updates };
    this.extractions.set(id, updated);
    return updated;
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }
}

export const storage = new MemStorage();
