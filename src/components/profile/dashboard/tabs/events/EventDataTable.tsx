
import React from 'react';
import { Button } from '@/components/ui/button';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface EventDataTableProps {
  onViewDetails: (event: any) => void;
}

export function EventDataTable({ onViewDetails }: EventDataTableProps) {
  const { 
    data: events = [], 
    isLoading,
    page,
    setPage,
    totalPages,
    hasNextPage,
    hasPreviousPage
  } = usePaginatedQuery<any>({
    queryKey: ['admin-events'],
    tableName: 'events',
    paginationOptions: {
      limit: 10,
      orderBy: 'created_at',
      orderDirection: 'desc'
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center h-64 text-center p-6">
        <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
        <p className="text-muted-foreground">Create your first event to get started</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event: any) => (
              <tr key={event.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4 max-w-[200px] truncate">{event.title}</td>
                <td className="py-3 px-4">
                  {event.start_time ? format(new Date(event.start_time), 'PPP') : 'N/A'}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline">{event.event_type || 'Other'}</Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge 
                    variant={
                      event.status === 'Approved' ? 'default' :
                      event.status === 'Pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {event.status || 'Pending'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onViewDetails(event)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {events.length} of {page * 10} events
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={!hasPreviousPage}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              disabled={!hasNextPage}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
