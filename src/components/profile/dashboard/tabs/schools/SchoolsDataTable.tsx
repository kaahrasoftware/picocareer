
import { useState } from "react";
import { useAllSchools } from "@/hooks/useAllSchools";
import { School, SchoolStatus, SchoolType } from "@/types/database/schools";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Pencil, 
  Trash, 
  ArrowUpDown, 
  Loader2, 
  GraduationCap 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SchoolDetailsDialog } from "./SchoolDetailsDialog";

interface SchoolsDataTableProps {
  onEditSchool: (school: School) => void;
}

export function SchoolsDataTable({ onEditSchool }: SchoolsDataTableProps) {
  const { data: schools, isLoading, refetch } = useAllSchools();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof School>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSort = (field: keyof School) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredSchools = schools
    ?.filter(school => 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.location && school.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue === null) return sortDirection === "asc" ? -1 : 1;
      if (bValue === null) return sortDirection === "asc" ? 1 : -1;

      return sortDirection === "asc"
        ? (aValue as any) > (bValue as any) ? 1 : -1
        : (aValue as any) < (bValue as any) ? 1 : -1;
    }) || [];

  const handleDeleteClick = (school: School) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (school: School) => {
    setSelectedSchool(school);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSchool) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("schools")
        .delete()
        .eq("id", selectedSchool.id);
      
      if (error) throw error;
      
      toast({
        title: "School deleted",
        description: `${selectedSchool.name} has been successfully deleted.`,
      });
      refetch();
    } catch (error) {
      console.error("Error deleting school:", error);
      toast({
        title: "Error",
        description: "Failed to delete school. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedSchool(null);
    }
  };

  const getStatusBadgeVariant = (status: SchoolStatus) => {
    switch (status) {
      case "Approved": return "success";
      case "Pending": return "warning";
      case "Rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search schools..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="text-sm text-muted-foreground">
          {filteredSchools.length} schools
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  Type
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("location")}
                >
                  Location
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading schools...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSchools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <GraduationCap className="h-10 w-10 mb-2" />
                    <h3 className="text-lg font-medium">No schools found</h3>
                    <p>Try adjusting your search or add a new school</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.type}</TableCell>
                  <TableCell>{school.location || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(school.status)} className="capitalize">
                      {school.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleViewDetails(school)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEditSchool(school)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteClick(school)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this school?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedSchool?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* School Details Dialog */}
      {selectedSchool && (
        <SchoolDetailsDialog
          open={isDetailsDialogOpen}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedSchool(null);
          }}
          school={selectedSchool}
          onEdit={() => {
            setIsDetailsDialogOpen(false);
            onEditSchool(selectedSchool);
          }}
        />
      )}
    </div>
  );
}
