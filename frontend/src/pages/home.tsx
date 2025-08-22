import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import LoginPanel from "@/components/login-panel";
import SearchFilters from "@/components/search-filters";
import ActivityLog from "@/components/activity-log";
import LeadsTable from "@/components/leads-table";
import SettingsModal from "@/components/settings-modal";
import { useExtraction } from "@/hooks/use-extraction";
import { useLeads } from "@/hooks/use-leads";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const { 
    isExtracting, 
    progress, 
    logs, 
    startExtraction, 
    stopExtraction,
    loginMutation,
    isLoginPending 
  } = useExtraction();
  
  const { data: leads = [] } = useLeads();

  const getStatusInfo = () => {
    if (isExtracting) {
      return { label: "Extracting...", variant: "default" as const };
    } else if (isLoggedIn) {
      return { label: "Ready", variant: "secondary" as const };
    } else {
      return { label: "Login Required", variant: "outline" as const };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'hsl(var(--linkedin-bg))' }}>
      {/* Header */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">LinkedIn Lead Extractor</h1>
                <p className="text-sm text-gray-600">Professional lead generation and data extraction tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={statusInfo.variant} className="ml-2">
                  {statusInfo.label}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Login Panel */}
        <div className="lg:col-span-1 space-y-6">
          <LoginPanel 
            onLoginSuccess={() => setIsLoggedIn(true)}
            loginMutation={loginMutation}
            isLoginPending={isLoginPending}
          />
          <SearchFilters 
            onStartExtraction={startExtraction}
            onStopExtraction={stopExtraction}
            isExtracting={isExtracting}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Activity Log & Leads Table */}
        <div className="lg:col-span-2 space-y-6">
          <ActivityLog 
            logs={logs}
            progress={progress}
            leadsCount={leads.length}
          />
          <LeadsTable leads={leads} />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
