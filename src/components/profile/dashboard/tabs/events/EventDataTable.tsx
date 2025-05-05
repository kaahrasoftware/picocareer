import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Edit, 
  Trash, 
  Star, 
  Eye, 
  Check, 
  X,
  Clock
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EventDataTableProps {
  onViewDetails: (event: any) => void;
}

export function EventDataTable({ onViewDetails }: EventDataTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Initialize page state first

  const { 
    data: events = [], 
    isLoading, 
    error, 
    count,
    setPage,
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage
  } = usePaginatedQuery<any>({
    queryKey: ['admin-events', currentPage, eventTypeFilter, statusFilter],
    tableName: 'events',
    paginationOptions: {
      limit: 10,
      page: currentPage, // Use the currentPage state variable
      orderBy: 'created_at',
      orderDirection: 'desc'
    },
    filters: {
      ...(eventTypeFilter ? { event_type: eventTypeFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {})
    }
  });

  // Update the local state when page changes from hook
  React.useEffect(() => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [page]);

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Event deleted successfully');
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete event: ${error.message}`);
    }
  };

  const handleToggleFeatured = async (event: any) => {
    if (!event?.id) {
      toast.error('Cannot update event: Missing event ID');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ featured: !event.featured })
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast.success(`Event ${event.featured ? 'unfeatured' : 'featured'} successfully`);
    } catch (error: any) {
      toast.error(`Failed to update event: ${error.message}`);
    }
  };

  const handleUpdateStatus = async (event: any, status: string) => {
    if (!event?.id) {
      toast.error('Cannot update event status: Missing event ID');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast.success(`Event status updated to ${status}`);
    } catch (error: any) {
      toast.error(`Failed to update event status: ${error.message}`);
    }
  };

  // Render loading state
  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // Render error state
  if (error) {
    return <div className="py-8 text-center text-red-500">
      Error loading events: {error.message || "Unknown error"}
    </div>;
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const event = row.original;
        if (!event) return null;
        
        return (
          <div className="flex flex-col">
            <span className="font-medium truncate max-w-[200px]">{event.title || 'Untitled Event'}</span>
            <span className="text-xs text-muted-foreground">
              {event.created_at ? formatDistance(new Date(event.created_at), new Date(), { addSuffix: true }) : 'Unknown date'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'event_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original?.event_type || 'Unknown';
        return (
          <Badge variant="outline">{type}</Badge>
        );
      },
    },
    {
      accessorKey: 'start_time',
      header: 'Date',
      cell: ({ row }) => {
        const startTime = row.original?.start_time;
        if (!startTime) return <span className="text-muted-foreground">Date not set</span>;
        
        const date = new Date(startTime);
        return (
          <div className="flex flex-col">
            <span>{date.toLocaleDateString()}</span>
            <span className="text-xs text-muted-foreground">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original?.status || 'Pending';
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        let icon = null;
        
        switch (status) {
          case 'Approved':
            variant = "default";
            icon = <Check className="w-3 h-3 mr-1" />;
            break;
          case 'Pending':
            variant = "secondary";
            icon = <Clock className="w-3 h-3 mr-1" />;
            break;
          case 'Rejected':
            variant = "destructive";
            icon = <X className="w-3 h-3 mr-1" />;
            break;
          default:
            variant = "outline";
        }
        
        return (
          <Badge variant={variant} className="flex items-center">
            {icon}{status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const event = row.original;
        if (!event) return null;
        
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleFeatured(event)}
              title={event.featured ? 'Remove from featured' : 'Add to featured'}
            >
              <Star className={`h-4 w-4 ${event.featured ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewDetails(event)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleUpdateStatus(event, 'Approved')}>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Approve Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(event, 'Pending')}>
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(event, 'Rejected')}>
                  <X className="h-4 w-4 mr-2 text-red-500" />
                  Reject Event
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => {
                    setEventToDelete(event);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Event Type Filters */}
        <Button
          variant={eventTypeFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setEventTypeFilter(null)}
        >
          All Types
        </Button>
        {['Webinar', 'Workshop', 'Coffee Time', 'Panel', 'Hackathon'].map(type => (
          <Button
            key={type}
            variant={eventTypeFilter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setEventTypeFilter(type)}
          >
            {type}
          </Button>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Status Filters */}
        <Button
          variant={statusFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter(null)}
        >
          All Status
        </Button>
        {['Approved', 'Pending', 'Rejected'].map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="py-12 text-center border rounded-lg">
          <p className="text-muted-foreground">No events found</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or create a new event</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={events}
        />
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPage(currentPage - 1)}
            disabled={!hasPreviousPage}
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            onClick={() => setPage(currentPage + 1)}
            disabled={!hasNextPage}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{eventToDelete?.title || 'Unknown'}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => eventToDelete && handleDeleteEvent(eventToDelete.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
