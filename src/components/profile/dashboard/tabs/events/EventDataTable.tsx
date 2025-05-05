
import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

interface EventDataTableProps {
  onViewDetails: (event: any) => void;
}

export function EventDataTable({ onViewDetails }: EventDataTableProps) {
  const { 
    data: events = [], 
    isLoading, 
    error
  } = usePaginatedQuery<any>({
    queryKey: ['admin-events'],
    tableName: 'events',
    paginationOptions: {
      limit: 10,
      orderBy: 'created_at',
      orderDirection: 'desc'
    }
  });

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
        return <span className="font-medium">{event?.title || 'Untitled Event'}</span>;
      },
    },
    {
      accessorKey: 'event_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original?.event_type || 'Unknown';
        return <Badge variant="outline">{type}</Badge>;
      },
    },
    {
      accessorKey: 'start_time',
      header: 'Date',
      cell: ({ row }) => {
        const startTime = row.original?.start_time;
        if (!startTime) return <span className="text-muted-foreground">Date not set</span>;
        
        const date = new Date(startTime);
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original?.status || 'Pending';
        return <Badge>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      {events.length === 0 ? (
        <div className="py-12 text-center border rounded-lg">
          <p className="text-muted-foreground">No events found</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={events}
        />
      )}
    </div>
  );
}
