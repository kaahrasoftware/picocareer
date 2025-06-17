
import { useState } from "react";
import { Major } from "@/types/database/majors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import { MajorFormDialog } from "./MajorFormDialog";
import { MajorDetailsDialog } from "./MajorDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MajorsDataTableProps {
  majors: Major[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function MajorsDataTable({
  majors,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onRefresh
}: MajorsDataTableProps) {
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOpenDetails = (major: Major) => {
    setSelectedMajor(major);
    setIsDetailsOpen(true);
  };

  const handleEditMajor = (major: Major) => {
    setSelectedMajor(major);
    setIsEditOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase
        .from("majors")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;

      toast({
        title: "Major deleted",
        description: "The major has been successfully deleted.",
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting major:", error);
      toast({
        title: "Error deleting major",
        description: "There was an error deleting the major. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (major: Major) => {
    try {
      const { error } = await supabase
        .from("majors")
        .update({ featured: !major.featured })
        .eq("id", major.id);

      if (error) throw error;

      toast({
        title: major.featured ? "Major unfeatured" : "Major featured",
        description: major.featured 
          ? "The major has been removed from featured." 
          : "The major has been added to featured.",
      });
      onRefresh();
    } catch (error) {
      console.error("Error toggling featured status:", error);
      toast({
        title: "Error updating major",
        description: "There was an error updating the major. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {majors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No majors found.
                </TableCell>
              </TableRow>
            ) : (
              majors.map((major) => (
                <TableRow key={major.id}>
                  <TableCell className="font-medium">{major.title}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFeatured(major)}
                      title={major.featured ? "Unfeature major" : "Feature major"}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          major.featured ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={major.status === "Approved" ? "default" : "outline"}
                    >
                      {major.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(major.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(major.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenDetails(major)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditMajor(major)}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeletingId(major.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>

      {/* Details Dialog */}
      {selectedMajor && (
        <MajorDetailsDialog
          open={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          major={selectedMajor}
        />
      )}

      {/* Edit Dialog */}
      {selectedMajor && (
        <MajorFormDialog
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setIsEditOpen(false);
            onRefresh();
          }}
          major={selectedMajor}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this major? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
