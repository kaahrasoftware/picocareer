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
    queryKey: ['admin-events', page, eventTypeFilter, statusFilter],
    tableName: 'events',
    paginationOptions: {
      limit: 10,
      page: 1,
      orderBy: 'created_at',
      orderDirection: 'desc'
    },
    filters: {
      ...(eventTypeFilter ? { event_type: eventTypeFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {})
    }
  });

  // Log for debugging purposes
  console.log("Events data table:", {
    events,
    isLoading,
    error,
    count,
    page
  });

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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[200px]">{row.original.title}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistance(new Date(row.original.created_at), new Date(), { addSuffix: true })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'event_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.event_type}</Badge>
      ),
    },
    {
      accessorKey: 'start_time',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.original.start_time);
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
        const status = row.original.status;
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

  if (isLoading) {
    return <div className="py-12 text-center">Loading events data...</div>;
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-500">
        Error loading events: {error.message}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No events found</p>
        <p className="text-sm mt-2">Try changing your filters or create a new event</p>
      </div>
    );
  }

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

      <DataTable
        columns={columns}
        data={events}
        filterColumn="title"
        filterPlaceholder="Filter by title..."
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{eventToDelete?.title}". This action cannot be undone.
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
