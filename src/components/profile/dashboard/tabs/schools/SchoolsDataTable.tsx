
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SchoolFormDialog } from "./SchoolFormDialog";
import { SchoolDetailsDialog } from "./SchoolDetailsDialog";

interface School {
  id: string;
  name: string;
  description: string;
  country: string;
  state: string;
  acceptance_rate: number;
  student_population: number;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

export function SchoolsDataTable() {
  const { toast } = useToast();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data: schools = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as School[];
    }
  });

  const handleDelete = async (schoolId: string) => {
    if (!confirm('Are you sure you want to delete this school?')) return;

    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);

      if (error) throw error;

      toast({
        title: "School deleted",
        description: "The school has been successfully deleted.",
      });

      refetch();
    } catch (error) {
      console.error('Error deleting school:', error);
      toast({
        title: "Error",
        description: "Failed to delete school. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (school: School) => {
    setSelectedSchool(school);
    setFormDialogOpen(true);
  };

  const handleView = (school: School) => {
    setSelectedSchool(school);
    setDetailsDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setSelectedSchool(null);
    refetch();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading schools...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Acceptance Rate</TableHead>
              <TableHead>Population</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No schools found
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.country}</TableCell>
                  <TableCell>{school.state}</TableCell>
                  <TableCell>{school.acceptance_rate}%</TableCell>
                  <TableCell>{school.student_population.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={school.status === "Approved" ? "default" : "outline"}>
                      {school.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(school)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(school)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(school.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SchoolFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedSchool(null);
        }}
        onSuccess={handleFormSuccess}
        school={selectedSchool || undefined}
      />

      {selectedSchool && (
        <SchoolDetailsDialog
          open={detailsDialogOpen}
          onClose={() => {
            setDetailsDialogOpen(false);
            setSelectedSchool(null);
          }}
          school={selectedSchool}
        />
      )}
    </>
  );
}
