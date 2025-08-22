

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertExtractionSchema, insertSettingsSchema } from "@shared/schema";
import * as XLSX from 'xlsx';
import axios from "axios";
import stringSimilarity from "string-similarity"; 
import dotenv from "dotenv";

dotenv.config();

type Lead = {
  id: number;
  name: string;
  jobTitle: string;
  company: string;
  location: string;
  // email: string | null;
  // phone: string | null;
  linkedinUrl: string;
  apolloData: any;
  extractedAt: Date;
};


export async function registerRoutes(app: Express): Promise<Server> {

  // Lead routes
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validatedLead = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedLead);
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid lead data" });
    }
  });

  app.post("/api/leads/batch", async (req, res) => {
    const API_TOKEN = process.env.API_TOKEN;
    const TASK_ID = process.env.TASK_ID; 

    try {
      // ⬇️ Query params from request
      const { jobTitle, location, industry } = req.query;

      // 1️⃣ Build LinkedIn Search URL
      const searchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(
        (jobTitle as string) || (industry as string) || "Manager"
      )}&location=${encodeURIComponent((location as string) || "United States")}`;

      console.log("🔎 Search URL:", searchUrl);

      // 2️⃣ Start new actor run with input JSON
      const runResponse = await axios.post(
        `https://api.apify.com/v2/actor-tasks/${TASK_ID}/runs?token=${API_TOKEN}`,
        {
          include_company_details: true,
          search_url: searchUrl,
        }
      );

      const runId = runResponse.data.data.id;
      const datasetId = runResponse.data.data.defaultDatasetId;
      console.log(`✅ Actor run started: ${runId}`);

      
      console.log("⏳ Waiting 60 seconds for Apify run...");
      await new Promise((resolve) => setTimeout(resolve, 60000));

      
      const datasetResponse = await axios.get(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${API_TOKEN}`
      );

      const apifyLeads = datasetResponse.data;
      console.log("📊 Total leads fetched:", apifyLeads.length);

      if (!apifyLeads.length) {
        return res
          .status(200)
          .json({ message: "No leads found. Check Apify run logs." });
      }

      
      const mappedLeads: Lead[] = apifyLeads.map((item: any, idx: number) => ({
        id: idx + 1,
        name: item.recruiter_name || item.company_name || "Unknown",
        jobTitle: item.title || "N/A",
        company: item.company_name || "N/A",
        location: item.location || "N/A",
        linkedinUrl: item.job_url || "#",
        apolloData: item,
        extractedAt: new Date(),
      }));

      
      const uniqueLeads: Lead[] = Array.from(
        new Map(mappedLeads.map((lead) => [lead.linkedinUrl, lead])).values()
      );
      console.log("✅ Leads after removing duplicates:", uniqueLeads.length);

      
      const validatedLeads: Lead[] = uniqueLeads.map((lead) => {
        const parsed = insertLeadSchema.parse(lead);
        return {
          ...parsed,
          id: lead.id,
          extractedAt: lead.extractedAt,
          apolloData: parsed.apolloData ?? {},
        };
      });

      const savedLeads = await storage.createLeads(validatedLeads);
      console.log("💾 Fresh leads saved to DB:", savedLeads.length);

      
      res.json(savedLeads);

    } catch (error: any) {
      console.error("❌ Failed to fetch/save leads:", error.message);
      res.status(500).json({
        message: "Failed to fetch/save leads from Apify",
        error: error.message,
      });
    }
  });



  app.delete("/api/leads", async (req, res) => {
    try {
      await storage.clearLeads();
      console.log(await storage.getLeads());
      res.json({ message: "All leads cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear leads" });
    }
  });

  // Export routes
  app.post("/api/export/csv", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      if (leads.length === 0) {
        return res.status(400).json({ message: "No leads to export" });
      }

      const headers = ['Name', 'Job Title', 'Company', 'Location', 'Email', 'Phone', 'LinkedIn URL'];
      const csvContent = [
        headers.join(','),
        ...leads.map(lead => [
          `"${lead.name}"`,
          `"${lead.jobTitle}"`,
          `"${lead.company}"`,
          `"${lead.location}"`,
          // `"${lead.email || ''}"`,
          // `"${lead.phone || ''}"`,
          `"${lead.linkedinUrl}"`
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="linkedin_leads.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  app.post("/api/export/excel", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      if (leads.length === 0) {
        return res.status(400).json({ message: "No leads to export" });
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(leads.map(lead => ({
        'Name': lead.name,
        'Job Title': lead.jobTitle,
        'Company': lead.company,
        'Location': lead.location,
        // 'Email': lead.email || '',
        // 'Phone': lead.phone || '',
        'LinkedIn URL': lead.linkedinUrl
      })));

      XLSX.utils.book_append_sheet(workbook, worksheet, 'LinkedIn Leads');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="linkedin_leads.xlsx"');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to export Excel" });
    }
  });

  // Extraction routes
  app.get("/api/extractions", async (req, res) => {
    try {
      const extractions = await storage.getExtractions();
      res.json(extractions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch extractions" });
    }
  });

  app.post("/api/extractions", async (req, res) => {
    try {
      const validatedExtraction = insertExtractionSchema.parse(req.body);
      const extraction = await storage.createExtraction(validatedExtraction);
      res.json(extraction);
    } catch (error) {
      res.status(400).json({ message: "Invalid extraction data" });
    }
  });

  app.patch("/api/extractions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const extraction = await storage.updateExtraction(id, updates);
      if (!extraction) {
        return res.status(404).json({ message: "Extraction not found" });
      }
      res.json(extraction);
    } catch (error) {
      res.status(500).json({ message: "Failed to update extraction" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const validatedSettings = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(validatedSettings);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  // Mock login routes
  app.post("/api/login/credentials", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Simulate login delay
    setTimeout(() => {
      res.json({ success: true, message: "Login successful" });
    }, 1500);
  });

  app.post("/api/login/cookies", async (req, res) => {
    const { cookies } = req.body;
    if (!cookies) {
      return res.status(400).json({ message: "Cookies required" });
    }

    try {
      JSON.parse(cookies);
      setTimeout(() => {
        res.json({ success: true, message: "Cookie login successful" });
      }, 1000);
    } catch (error) {
      res.status(400).json({ message: "Invalid cookies format" });
    }
  });



  // GET -> direct redirect
  app.get("/api/login/credentials", (req, res) => {
    res.redirect("https://www.linkedin.com/login");
  });

  // POST -> agar aapko future me credentials check karne hain
  app.post("/api/login/credentials", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    setTimeout(() => {
      res.redirect("https://www.linkedin.com/login");
    }, 1500);
  });


  const httpServer = createServer(app);
  return httpServer;
}
