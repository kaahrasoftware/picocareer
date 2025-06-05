
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Star,
  StarOff,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { StandardPagination } from '@/components/common/StandardPagination';

interface Career {
  id: string;
  title: string;
  description: string;
  industry?: string;
  status: string;
  featured: boolean;
  salary_range?: string;
  required_education?: string[];
  image_url?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface CareersDataTableProps {
  careers: Career[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  onViewDetails: (careerId: string) => void;
  onApprove: (careerId: string) => void;
  onReject: (careerId: string) => void;
  onToggleFeature: (careerId: string, currentFeatured: boolean) => void;
  onEdit: (career: Career) => void;
  onDelete: (careerId: string) => void;
  onSort: (column: string) => void;
  currentSortColumn: string;
  currentSortDirection: 'asc' | 'desc';
}

export function CareersDataTable({
  careers,
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
  currentSortDirection
}: CareersDataTableProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {currentSortColumn === column && (
          currentSortDirection === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Career</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div>
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px] mt-1" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading careers</h3>
          <p className="text-muted-foreground">
            {error?.message || 'An unexpected error occurred'}
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (careers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No careers found</h3>
          <p className="text-muted-foreground">
            No careers match your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="title">Career</SortableHeader>
              <SortableHeader column="status">Status</SortableHeader>
              <SortableHeader column="industry">Industry</SortableHeader>
              <TableHead>Education</TableHead>
              <TableHead>Salary</TableHead>
              <SortableHeader column="featured">Featured</SortableHeader>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {careers.map((career) => (
              <TableRow key={career.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={career.image_url} alt={career.title} />
                      <AvatarFallback>
                        {career.title.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{career.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {career.profiles?.full_name || 'Unknown author'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(career.status)}>
                    {career.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {career.industry && (
                    <Badge variant="outline">{career.industry}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {career.required_education && career.required_education.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {career.required_education.slice(0, 2).map((edu, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {edu}
                        </Badge>
                      ))}
                      {career.required_education.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{career.required_education.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{career.salary_range || 'Not specified'}</span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleFeature(career.id, career.featured)}
                  >
                    {career.featured ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => onViewDetails(career.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(career)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {career.status === 'Pending' && (
                        <>
                          <DropdownMenuItem onClick={() => onApprove(career.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject(career.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onDelete(career.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <StandardPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
