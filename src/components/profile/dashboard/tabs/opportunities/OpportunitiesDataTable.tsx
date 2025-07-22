
import React from 'react';
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Edit } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

interface Opportunity {
  id: string;
  title: string;
  provider_name?: string;
  type: 'scholarship' | 'event' | 'job' | 'internship' | 'fellowship' | 'grant' | 'competition' | 'volunteer' | 'other';
  deadline?: string;
  status: string;
  created_at: string;
  application_url?: string;
}

interface OpportunitiesDataTableProps {
  opportunities: Opportunity[];
  onEdit?: (opportunity: Opportunity) => void;
  isLoading?: boolean;
}

export function OpportunitiesDataTable({ opportunities, onEdit, isLoading }: OpportunitiesDataTableProps) {
  const getTypeColor = (type: Opportunity['type']) => {
    const colors = {
      scholarship: 'bg-purple-100 text-purple-800',
      event: 'bg-blue-100 text-blue-800',
      job: 'bg-green-100 text-green-800',
      internship: 'bg-yellow-100 text-yellow-800',
      fellowship: 'bg-indigo-100 text-indigo-800',
      grant: 'bg-pink-100 text-pink-800',
      competition: 'bg-orange-100 text-orange-800',
      volunteer: 'bg-teal-100 text-teal-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  const columns = [
    {
      header: "Title",
      accessorKey: "title",
      cell: ({ row }: { row: { original: Opportunity } }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      header: "Provider",
      accessorKey: "provider_name",
      cell: ({ row }: { row: { original: Opportunity } }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.provider_name || "N/A"}
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: ({ row }: { row: { original: Opportunity } }) => {
        const type = row.original.type;
        const validType = ['scholarship', 'event', 'job', 'internship', 'fellowship', 'grant', 'competition', 'volunteer', 'other'].includes(type as string) 
          ? type as Opportunity['type']
          : 'other' as const;
        
        return (
          <Badge className={getTypeColor(validType)}>
            {validType.charAt(0).toUpperCase() + validType.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: "Deadline",
      accessorKey: "deadline",
      cell: ({ row }: { row: { original: Opportunity } }) => {
        if (!row.original.deadline) return <span className="text-muted-foreground">No deadline</span>;
        const deadline = new Date(row.original.deadline);
        const isExpired = deadline < new Date();
        return (
          <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-foreground'}`}>
            {deadline.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row: { original: Opportunity } }) => (
        <Badge variant={row.original.status === 'Published' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessorKey: "created_at",
      cell: ({ row }: { row: { original: Opportunity } }) => (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
        </div>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }: { row: { original: Opportunity } }) => (
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {row.original.application_url && (
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a
                href={row.original.application_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={opportunities}
      searchKey="title"
      searchPlaceholder="Search opportunities..."
    />
  );
}
