import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { generateMockLeads } from "@/lib/mock-data";
import { useCreateLeadsBatch } from "./use-leads";
import { useToast } from "@/hooks/use-toast";

export interface ExtractionFilters {
  jobTitle?: string;
  location?: string;
  industry?: string;
  limit: number;
  startPage: number;
  endPage: number;
  delay: number;
}

// Ye sirf backend ko bhejne ke liye
export type ApiFilters = Pick<ExtractionFilters, "jobTitle" | "location" | "industry">;

export interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export function useExtraction() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date(), message: "Application initialized successfully", type: "info" },
    { timestamp: new Date(), message: "Chrome profile configuration loaded", type: "info" },
    { timestamp: new Date(), message: "Ready to start lead extraction", type: "info" }
  ]);

  const extractionRef = useRef<number | null>(null);
  const createLeadsBatch = useCreateLeadsBatch();
  const { toast } = useToast();

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date(), message, type }]);
  };

  const loginMutation = useMutation({
    mutationFn: async ({ type, data }: { type: 'credentials' | 'cookies', data: any }) => {
      const endpoint = type === 'credentials' ? '/api/login/credentials' : '/api/login/cookies';
      const response = await apiRequest("POST", endpoint, data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      const method = variables.type === 'credentials' ? 'credentials' : 'cookies';
      window.open("https://www.linkedin.com/login", "_blank");
      addLog(`Login successful with ${method}!`, 'success');
      toast({
        title: "Login Successful",
        description: `You are now logged in to LinkedIn via ${method}`,
      });
    },
    onError: (error, variables) => {
      const method = variables.type === 'credentials' ? 'credentials' : 'cookies';
      addLog(`Login failed with ${method}: ${error.message}`, 'error');
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const extractionMutation = useMutation({
    mutationFn: async (filters: ExtractionFilters) => {
      addLog(`Starting extraction with filters: Job Title: "${filters.jobTitle}", Location: "${filters.location}", Industry: "${filters.industry}"`, 'info');
      addLog(`Extracting ${filters.limit} leads from pages ${filters.startPage} to ${filters.endPage}`, 'info');

      setIsExtracting(true);
      setProgress(0);

      // Generate mock leads based on filters
      const mockLeads = generateMockLeads(
        filters.jobTitle,
        filters.location,
        filters.industry,
        Math.min(filters.limit, 50) // Cap at 50 for demo
      );

      // Simulate extraction process with progress updates
      const totalSteps = mockLeads.length;
      const batchSize = 1;

      for (let i = 0; i < totalSteps; i += batchSize) {
        if (extractionRef.current === null) break; // Check if cancelled

        const batch = mockLeads.slice(i, i + batchSize);

        // Add leads to database
        await createLeadsBatch.mutateAsync({
          leads: batch,
          filters : {
            location: filters.location,
            jobTitle: filters.jobTitle,
            industry: filters.industry,
          } ,
        });

        // Log each extracted lead
        batch.forEach(lead => {
          addLog(`Extracted lead: ${lead.name} - ${lead.jobTitle} at ${lead.company}`, 'success');
        });

        // Update progress
        const currentProgress = Math.floor(((i + batchSize) / totalSteps) * 100);
        setProgress(currentProgress);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, filters.delay));
      }

      return { count: mockLeads.length };
    },
    onSuccess: (data) => {
      setProgress(100);
      addLog(`Extraction completed successfully! Found ${data.count} leads.`, 'success');
      toast({
        title: "Extraction Complete",
        description: `Successfully extracted ${data.count} leads`,
      });
    },
    onError: (error) => {
      addLog(`Extraction failed: ${error.message}`, 'error');
      toast({
        title: "Extraction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsExtracting(false);
      extractionRef.current = null;
    }
  });

  const startExtraction = (filters: ExtractionFilters) => {
    if (isExtracting) {
      toast({
        title: "Extraction in Progress",
        description: "Please wait for current extraction to complete",
        variant: "destructive",
      });
      return;
    }

    extractionRef.current = Date.now();
    extractionMutation.mutate(filters);
  };

  const stopExtraction = () => {
    if (extractionRef.current) {
      extractionRef.current = null;
      setIsExtracting(false);
      addLog("Extraction cancelled by user", 'warning');
      toast({
        title: "Extraction Cancelled",
        description: "Extraction has been stopped",
      });
    }
  };

  return {
    isExtracting,
    progress,
    logs,
    addLog,
    startExtraction,
    stopExtraction,
    loginMutation,
    isLoginPending: loginMutation.isPending,
  };
}
