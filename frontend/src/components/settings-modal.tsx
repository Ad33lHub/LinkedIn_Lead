import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Settings, type InsertSettings } from "@shared/schema";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<Partial<InsertSettings>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<InsertSettings>) => {
      const response = await apiRequest("PATCH", "/api/settings", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Settings Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        exportFormat: settings.exportFormat,
        autoSave: settings.autoSave,
        showNotifications: settings.showNotifications,
        theme: settings.theme,
        rememberCredentials: settings.rememberCredentials,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const updateSetting = <K extends keyof InsertSettings>(
    key: K, 
    value: InsertSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Export Format */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Export Format</Label>
            <RadioGroup 
              value={localSettings.exportFormat || 'csv'}
              onValueChange={(value) => updateSetting('exportFormat', value as 'csv' | 'excel')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="text-sm">CSV (.csv)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="text-sm">Excel (.xlsx)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Auto Save */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-save"
              checked={localSettings.autoSave ?? true}
              onCheckedChange={(checked) => updateSetting('autoSave', !!checked)}
            />
            <Label htmlFor="auto-save" className="text-sm">
              Auto-save extracted leads
            </Label>
          </div>

          {/* Show Notifications */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifications"
              checked={localSettings.showNotifications ?? true}
              onCheckedChange={(checked) => updateSetting('showNotifications', !!checked)}
            />
            <Label htmlFor="notifications" className="text-sm">
              Show notifications
            </Label>
          </div>

          {/* Remember Credentials */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-credentials"
              checked={localSettings.rememberCredentials ?? false}
              onCheckedChange={(checked) => updateSetting('rememberCredentials', !!checked)}
            />
            <Label htmlFor="remember-credentials" className="text-sm">
              Remember login credentials
            </Label>
          </div>

          {/* Theme */}
          <div>
            <Label htmlFor="theme" className="text-sm font-medium mb-2 block">
              Theme
            </Label>
            <Select 
              value={localSettings.theme || 'light'}
              onValueChange={(value) => updateSetting('theme', value as 'light' | 'dark' | 'auto')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="btn-linkedin"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
