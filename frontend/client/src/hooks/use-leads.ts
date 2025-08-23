import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { type Lead, type InsertLead } from "@shared/schema";

export function useLeads() {
  return useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lead: InsertLead) => {
      const response = await apiRequest("POST", "/api/leads", lead);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });
}



type ExtractionFilters = {
  location?: string;
   jobTitle?: string;
  industry?: string;
};

export function useCreateLeadsBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leads, filters }: { leads: InsertLead[], filters: ExtractionFilters }) => {
      const params = new URLSearchParams();
      if (filters.location) params.append("location", filters.location);
      if (filters.jobTitle) params.append("jobTitle", filters.jobTitle);
      if (filters.industry) params.append("industry", filters.industry);

      const response = await apiRequest(
        "POST",
        `/api/leads/batch?${params.toString()}`,
        leads
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });
}


export function useClearLeads() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/leads");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });
}







export function useFetchApify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/fetch-apify");
      return response.json();
    },
    onSuccess: () => {
      // refresh kar de leads ki list ko
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });
}
