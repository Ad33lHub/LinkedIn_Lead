import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Table as TableIcon,
  ExternalLink,
  Mail,
  Phone,
  Search
} from "lucide-react";
import { type Lead } from "@shared/schema";

interface LeadsTableProps {
  leads: Lead[];
}

type SortField = keyof Lead;
type SortDirection = 'asc' | 'desc';

export default function LeadsTable({ leads }: LeadsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const leadsPerPage = 10;

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [leads, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const currentLeads = sortedLeads.slice(startIndex, startIndex + leadsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSortIcon = (field: SortField) => {
    return (
      <ArrowUpDown 
        className={`w-4 h-4 ml-2 ${
          sortField === field ? 'text-primary' : 'text-gray-400'
        }`} 
      />
    );
  };

  if (leads.length === 0) {
    return (
      <Card className="card-shadow">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TableIcon className="w-5 h-5 text-primary mr-2" />
              Extracted Leads Preview
            </CardTitle>
            <Badge variant="outline">0 leads</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-12">
          <div className="text-center text-gray-500">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No leads extracted yet</p>
            <p className="text-sm">Start extraction to see lead data here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TableIcon className="w-5 h-5 text-primary mr-2" />
            Extracted Leads Preview
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">{leads.length} leads</Badge>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Full Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('jobTitle')}
                >
                  <div className="flex items-center">
                    Job Title
                    {getSortIcon('jobTitle')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center">
                    Company
                    {getSortIcon('company')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center">
                    Location
                    {getSortIcon('location')}
                  </div>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>LinkedIn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10 bg-primary text-white">
                        <AvatarFallback className="bg-primary text-white">
                          {getInitials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        {lead.apolloData && typeof lead.apolloData === 'object' && 'score' in lead.apolloData && (
                          <div className="text-sm text-gray-500">
                            Score: {(lead.apolloData as any).score}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{lead.jobTitle}</div>
                    {lead.apolloData && typeof lead.apolloData === 'object' && 'department' in lead.apolloData && (
                      <div className="text-sm text-gray-500">
                        {(lead.apolloData as any).department}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">{lead.company}</TableCell>
                  <TableCell className="text-sm text-gray-900">{lead.location}</TableCell>
                  <TableCell>
                    {lead.email ? (
                      <a 
                        href={`mailto:${lead.email}`}
                        className="flex items-center text-primary hover:text-primary/80 text-sm"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.phone ? (
                      <a 
                        href={`tel:${lead.phone}`}
                        className="flex items-center text-primary hover:text-primary/80 text-sm"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <a 
                      href={lead.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
