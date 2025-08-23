import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, FileSpreadsheet, Trash2, RefreshCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClearLeads } from "@/hooks/use-leads";
import { exportToCSV, exportToExcel } from "@/lib/export-utils";
import { type LogEntry } from "@/hooks/use-extraction";

interface ActivityLogProps {
  logs: LogEntry[];
  progress: number;
  leadsCount: number;
}

export default function ActivityLog({ logs, progress, leadsCount }: ActivityLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const clearLeadsMutation = useClearLeads();

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleExportCSV = async () => {
    if (leadsCount === 0) {
      toast({
        title: "No Data",
        description: "No leads available to export",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportToCSV();
      toast({
        title: "Export Successful",
        description: "CSV file downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV file",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = async () => {
    if (leadsCount === 0) {
      toast({
        title: "No Data",
        description: "No leads available to export",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportToExcel();
      toast({
        title: "Export Successful",
        description: "Excel file downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export Excel file",
        variant: "destructive",
      });
    }
  };

  const handleClearLeads = () => {
    if (leadsCount === 0) {
      toast({
        title: "No Data",
        description: "No leads to clear",
        variant: "destructive",
      });
      return;
    }

    const confirmClear = window.confirm(
      "Are you sure you want to clear all leads? This action cannot be undone."
    );
    
    if (confirmClear) {
      clearLeadsMutation.mutate();
      toast({
        title: "Leads Cleared",
        description: "All leads have been removed",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 text-primary mr-2" />
            Activity Log
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status:</span>
            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Ready
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Extraction Progress</span>
            <span className="text-sm font-medium text-gray-800">{progress}%</span>
          </div>
          <Progress value={progress} className="progress-bar-animate" />
        </div>

        {/* Log Container */}
        <ScrollArea className="h-64 bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className={`log-entry ${log.type}`}>
                <span className="text-gray-500">[{formatTime(log.timestamp)}]</span> {log.message}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </ScrollArea>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={handleExportCSV}
            disabled={leadsCount === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          
          <Button
            onClick={handleExportExcel}
            disabled={leadsCount === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          
          <Button
            onClick={handleClearLeads}
            disabled={leadsCount === 0 || clearLeadsMutation.isPending}
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
