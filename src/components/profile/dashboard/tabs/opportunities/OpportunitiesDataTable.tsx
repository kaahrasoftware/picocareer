
import React from 'react';
import { OpportunityWithAnalytics } from '@/types/opportunity/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  MoreVertical,
  Star,
  Trash,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { getOpportunityTypeStyles } from '@/utils/opportunityUtils';
import { format } from 'date-fns';

interface OpportunitiesDataTableProps {
  opportunities: OpportunityWithAnalytics[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  onViewDetails: (opportunityId: string) => void;
  onApprove: (opportunityId: string) => void;
  onReject: (opportunityId: string) => void;
  onToggleFeature: (opportunityId: string, currentFeatured: boolean) => void;
  onEdit: (opportunityId: string) => void;
  onDelete: (opportunityId: string) => void;
  onSort: (column: string) => void;
  currentSortColumn: string;
  currentSortDirection: 'asc' | 'desc';
}

export function OpportunitiesDataTable({
  opportunities,
  isLoading,
  isError,
  error,
  page,
  setPage,
  totalPages,
  onViewDetails,
  onApprove,
  onReject,
  onToggleFeature,
  onEdit,
  onDelete,
  onSort,
  currentSortColumn,
  currentSortDirection,
}: OpportunitiesDataTableProps) {
  const renderSortIcon = (columnName: string) => {
    if (currentSortColumn !== columnName) return null;
    return currentSortDirection === 'asc' ? '↑' : '↓';
  };

  // Helper function to render the status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case 'Closed':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Closed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Error loading opportunities: {error?.message || 'Unknown error'}</p>
        <Button className="mt-4" onClick={() => setPage(1)}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('title')}
              >
                Title {renderSortIcon('title')}
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('status')}
              >
                Status {renderSortIcon('status')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('created_at')}
              >
                Created {renderSortIcon('created_at')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('deadline')}
              >
                Deadline {renderSortIcon('deadline')}
              </TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={10}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
            ) : opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  No opportunities found.
                </TableCell>
              </TableRow>
            ) : (
              opportunities.map((opportunity) => {
                const typeStyles = getOpportunityTypeStyles(opportunity.opportunity_type);
                
                return (
                  <TableRow key={opportunity.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {opportunity.title}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${typeStyles.bg} ${typeStyles.text} ${typeStyles.border}`}>
                        {opportunity.opportunity_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderStatusBadge(opportunity.status)}</TableCell>
                    <TableCell>
                      {opportunity.created_at 
                        ? format(new Date(opportunity.created_at), 'MMM dd, yyyy')
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {opportunity.deadline 
                        ? format(new Date(opportunity.deadline), 'MMM dd, yyyy')
                        : 'No deadline'
                      }
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {opportunity.provider_name}
                    </TableCell>
                    <TableCell>
                      {opportunity.analytics?.views_count || 0}
                    </TableCell>
                    <TableCell>
                      {opportunity.analytics?.applications_count || 0}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={opportunity.featured ? "default" : "outline"}
                        onClick={() => onToggleFeature(opportunity.id, !!opportunity.featured)}
                      >
                        <Star className={`h-4 w-4 ${opportunity.featured ? 'fill-current' : ''}`} />
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewDetails(opportunity.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {opportunity.status === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-800 hover:bg-green-100"
                              onClick={() => onApprove(opportunity.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-800 hover:bg-red-100"
                              onClick={() => onReject(opportunity.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(opportunity.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete(opportunity.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
