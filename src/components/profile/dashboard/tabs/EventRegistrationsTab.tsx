
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Download, Search, Filter } from 'lucide-react';

export function EventRegistrationsTab() {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: registrations,
    isLoading: isRegistrationsLoading,
    count: totalCount,
    page,
    setPage,
    totalPages
  } = usePaginatedQuery<any>({
    queryKey: ['event-registrations', selectedEvent, searchQuery],
    tableName: 'event_registrations',
    paginationOptions: {
      limit: 15,
      orderBy: 'created_at',
      orderDirection: 'desc',
      searchQuery: searchQuery,
      searchColumn: 'email'
    },
    filters: selectedEvent !== 'all' ? { event_id: selectedEvent } : {},
    select: `
      id, first_name, last_name, email, country, 
      status, created_at, event_id,
      "current academic field/position", "current school/company",
      events(id, title)
    `
  });

  // Fetch all events for the dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title')
          .order('title');
        
        if (error) throw error;
        setEvents(data || []);
      } catch (error: any) {
        console.error('Error fetching events:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle exporting registrations as CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('event_registrations')
        .select(`
          id, first_name, last_name, email, country, 
          status, created_at, 
          "current academic field/position", "current school/company",
          events(id, title)
        `);
      
      if (selectedEvent !== 'all') {
        query = query.eq('event_id', selectedEvent);
      }

      if (searchQuery) {
        query = query.ilike('email', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Format the data for CSV
        const formattedData = data.map(reg => ({
          'First Name': reg.first_name,
          'Last Name': reg.last_name,
          'Email': reg.email,
          'Country': reg.country || 'Not specified',
          'Academic Field/Position': reg["current academic field/position"] || 'Not specified',
          'School/Company': reg["current school/company"] || 'Not specified',
          'Event': reg.events?.title || 'Unknown Event',
          'Registration Date': format(new Date(reg.created_at), 'yyyy-MM-dd HH:mm:ss'),
          'Status': reg.status
        }));

        // Convert to CSV
        const header = Object.keys(formattedData[0]).join(',');
        const rows = formattedData.map(row => 
          Object.values(row).map(val => `"${val}"`).join(',')
        );
        const csv = [header, ...rows].join('\n');
        
        // Create and download the file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `event-registrations-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error: any) {
      console.error('Error exporting registrations:', error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Event Registrations</h2>
        <Button
          onClick={handleExport}
          className="flex items-center gap-2"
          disabled={isExporting}
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export as CSV'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-1/3">
              <Select
                value={selectedEvent}
                onValueChange={setSelectedEvent}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Academic Field/Position</TableHead>
                  <TableHead>School/Company</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRegistrationsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Loading registrations...
                    </TableCell>
                  </TableRow>
                ) : registrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No registrations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  registrations.map((registration) => (
                    <TableRow key={registration.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {registration.events?.title || 'Unknown Event'}
                      </TableCell>
                      <TableCell>
                        {registration.first_name} {registration.last_name}
                      </TableCell>
                      <TableCell>{registration.email}</TableCell>
                      <TableCell>
                        {format(new Date(registration.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{registration.country || 'Not specified'}</TableCell>
                      <TableCell>{registration["current academic field/position"] || 'Not specified'}</TableCell>
                      <TableCell>{registration["current school/company"] || 'Not specified'}</TableCell>
                      <TableCell>
                        <Badge variant={registration.status === 'registered' ? 'default' : 'outline'}>
                          {registration.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1} 
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show at most 5 page numbers
                    let pageNum = page;
                    if (page <= 3) {
                      // At the start, show 1, 2, 3, 4, 5
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      // At the end, show last 5 pages
                      pageNum = totalPages - 4 + i;
                    } else {
                      // In the middle, show current page and 2 before/after
                      pageNum = page + (i - 2);
                    }
                    
                    // Only show valid page numbers
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink 
                            onClick={() => setPage(pageNum)}
                            isActive={page === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages} 
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <div className="text-sm text-muted-foreground text-center mt-4">
            Showing {registrations.length} of {totalCount} registrations
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
