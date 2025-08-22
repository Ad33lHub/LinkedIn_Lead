import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Play, Square, Briefcase, MapPin, Building, Hash, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type ExtractionFilters } from "@/hooks/use-extraction";

interface SearchFiltersProps {
  onStartExtraction: (filters: ExtractionFilters) => void;
  onStopExtraction: () => void;
  isExtracting: boolean;
  isLoggedIn: boolean;
}

export default function SearchFilters({ 
  onStartExtraction, 
  onStopExtraction, 
  isExtracting, 
  isLoggedIn 
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<ExtractionFilters>({
    jobTitle: '',
    location: '',
    industry: '',
    limit: 50,
    startPage: 1,
    endPage: 3,
    delay: 2000
  });
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to LinkedIn first",
        variant: "destructive",
      });
      return;
    }

    if (!filters.jobTitle && !filters.location && !filters.industry) {
      toast({
        title: "Search Criteria Required",
        description: "Please provide at least one search criterion",
        variant: "destructive",
      });
      return;
    }

    if (filters.limit < 1 || filters.limit > 1000) {
      toast({
        title: "Invalid Limit",
        description: "Lead count must be between 1 and 1000",
        variant: "destructive",
      });
      return;
    }

    onStartExtraction(filters);
  };

  const updateFilter = (key: keyof ExtractionFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center">
          <Filter className="w-5 h-5 text-primary mr-2" />
          Search Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="job-title" className="flex items-center mb-2">
              <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
              Job Title
            </Label>
            <Input
              id="job-title"
              placeholder="e.g., Marketing Manager"
              value={filters.jobTitle}
              onChange={(e) => updateFilter('jobTitle', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="location" className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="e.g., New York, NY"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="industry" className="flex items-center mb-2">
              <Building className="w-4 h-4 text-gray-400 mr-2" />
              Industry
            </Label>
            <Select value={filters.industry} onValueChange={(value) => updateFilter('industry', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="consulting">Consulting</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="limit" className="flex items-center mb-2">
                <Hash className="w-4 h-4 text-gray-400 mr-2" />
                Leads Count
              </Label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="1000"
                value={filters.limit}
                onChange={(e) => updateFilter('limit', parseInt(e.target.value) || 50)}
              />
            </div>
            
            <div>
              <Label htmlFor="delay" className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                Delay (ms)
              </Label>
              <Input
                id="delay"
                type="number"
                min="500"
                max="10000"
                value={filters.delay}
                onChange={(e) => updateFilter('delay', parseInt(e.target.value) || 2000)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-page" className="block mb-2">Start Page</Label>
              <Input
                id="start-page"
                type="number"
                min="1"
                value={filters.startPage}
                onChange={(e) => updateFilter('startPage', parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div>
              <Label htmlFor="end-page" className="block mb-2">End Page</Label>
              <Input
                id="end-page"
                type="number"
                min="1"
                value={filters.endPage}
                onChange={(e) => updateFilter('endPage', parseInt(e.target.value) || 3)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isExtracting ? (
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Start Extraction
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={onStopExtraction}
                variant="destructive"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Extraction
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
