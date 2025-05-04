
import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from 'date-fns';

interface EventDataTableProps {
  onViewDetails: (event: any) => void;
}

export function EventDataTable({ onViewDetails }: EventDataTableProps) {
  // This is a simplified version that just imports from the existing component
  // but with proper type definitions to prevent errors
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return <Badge>Pending</Badge>;
      },
    },
  ];

  return (
    <div>
      <div className="py-12 text-center border rounded-lg">
        <p className="text-muted-foreground">No events found</p>
        <p className="text-sm text-muted-foreground mt-2">Try creating a new event</p>
      </div>
    </div>
  );
}
