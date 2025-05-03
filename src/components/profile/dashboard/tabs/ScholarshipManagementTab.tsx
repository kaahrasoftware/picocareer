
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Check, Edit, Eye, Loader2, MoreHorizontal, Plus, Search, Star, StarOff, Trash2, X 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScholarshipDashboardStats } from "./scholarship/ScholarshipDashboardStats";
import { ScholarshipDetailsDialog } from "./scholarship/ScholarshipDetailsDialog";
import { toast } from "sonner";

// Type definition for our scholarship data
interface Scholarship {
  id: string;
  title: string;
  provider_name: string;
  status: string;
  created_at: string;
  amount: number | null;
  deadline: string | null;
  views_count: number | null;
  total_applicants: number | null;
  featured: boolean;
  source_verified: boolean;
}

export function ScholarshipManagementTab() {
  const queryClient = useQueryClient();
  const [selectedScholarship, setSelectedScholarship] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scholarshipToDelete, setScholarshipToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch scholarships data
  const { data: scholarships, isLoading, error } = useQuery({
    queryKey: ['admin-scholarships', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('scholarships')
        .select('*');
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,provider_name.ilike.%${searchQuery}%`);
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Scholarship[];
    }
  });

  // Fetch scholarship stats with accurate counts and total amount
  const { data: stats } = useQuery({
    queryKey: ['scholarship-stats'],
    queryFn: async () => {
      // Get total count of all scholarships regardless of status
      const { count: total, error: totalError } = await supabase
        .from('scholarships')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;
      
      // Get active count
      const { count: active, error: activeError } = await supabase
        .from('scholarships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');
      
      if (activeError) throw activeError;
      
      // Get pending count
      const { count: pending, error: pendingError } = await supabase
        .from('scholarships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');
      
      if (pendingError) throw pendingError;
      
      // Get featured count
      const { count: featured, error: featuredError } = await supabase
        .from('scholarships')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);
      
      if (featuredError) throw featuredError;

      // Calculate total scholarship amount
      const { data: amountData, error: amountError } = await supabase
        .from('scholarships')
        .select('amount');
      
      if (amountError) throw amountError;
      
      const totalAmount = amountData.reduce((sum, scholarship) => {
        // Use COALESCE-like logic to handle nulls
        const amount = scholarship.amount || 0;
        return sum + amount;
      }, 0);

      return {
        total: total || 0,
        active: active || 0,
        pending: pending || 0,
        featured: featured || 0,
        totalAmount
      };
    }
  });

  // Mutation to update scholarship featured status
  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string, featured: boolean }) => {
      const { error } = await supabase
        .from('scholarships')
        .update({ featured })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
      queryClient.invalidateQueries({ queryKey: ['scholarship-stats'] });
      toast.success("Scholarship updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    }
  });

  // Mutation to update scholarship status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from('scholarships')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
      queryClient.invalidateQueries({ queryKey: ['scholarship-stats'] });
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });

  // Mutation to delete scholarship
  const deleteScholarshipMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
      queryClient.invalidateQueries({ queryKey: ['scholarship-stats'] });
      setIsDeleteDialogOpen(false);
      setScholarshipToDelete(null);
      toast.success("Scholarship deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
      setIsDeleteDialogOpen(false);
    }
  });

  // Define columns for the data table
  const columns = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("title")}</div>
          <div className="text-sm text-muted-foreground">{row.original.provider_name}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === "Active" ? "default" : status === "Pending" ? "outline" : "secondary"}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount") || "0");
        return amount ? `$${amount.toLocaleString()}` : "N/A";
      },
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
      cell: ({ row }) => {
        const deadline = row.getValue("deadline") as string;
        return deadline ? new Date(deadline).toLocaleDateString() : "No deadline";
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        return new Date(row.getValue("created_at")).toLocaleDateString();
      },
    },
    {
      accessorKey: "views_count",
      header: "Views",
      cell: ({ row }) => row.getValue("views_count") || 0,
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) => {
        const isFeatured = row.getValue("featured") as boolean;
        const scholarship = row.original;
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFeatureMutation.mutate({ 
              id: scholarship.id, 
              featured: !isFeatured 
            })}
          >
            {isFeatured ? (
              <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const scholarship = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setSelectedScholarship(scholarship.id);
                setIsDetailsOpen(true);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                // Edit functionality would go here
                setSelectedScholarship(scholarship.id);
                setIsDetailsOpen(true);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => updateStatusMutation.mutate({ 
                  id: scholarship.id, 
                  status: scholarship.status === 'Active' ? 'Inactive' : 'Active'
                })}
              >
                {scholarship.status === 'Active' ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Mark Inactive
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Mark Active
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => {
                  setScholarshipToDelete(scholarship.id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        Error loading scholarships: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Scholarship Management</h2>

      {/* Dashboard Stats */}
      <ScholarshipDashboardStats stats={stats} />
      
      {/* Controls and Content */}
      <div>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search scholarships..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Scholarship
          </Button>
        </div>

        {/* Main Data Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : scholarships && scholarships.length > 0 ? (
          <DataTable columns={columns} data={scholarships} />
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No scholarships found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the scholarship.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (scholarshipToDelete) {
                  deleteScholarshipMutation.mutate(scholarshipToDelete);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteScholarshipMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scholarship Details/Edit Dialog */}
      {selectedScholarship && (
        <ScholarshipDetailsDialog
          scholarshipId={selectedScholarship}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onScholarshipUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
          }}
        />
      )}
    </div>
  );
}
