
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentForm } from "./forms/DepartmentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Plus, Pencil, Trash2 } from "lucide-react";
import { HubDepartment } from "@/types/database/hubs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface HubDepartmentsProps {
  hubId: string;
  isAdmin?: boolean;
  isModerator?: boolean;
}

const departmentColors = [
  "bg-[#F2FCE2] hover:bg-[#F2FCE2]/90 border-green-200",
  "bg-[#FEF7CD] hover:bg-[#FEF7CD]/90 border-yellow-200",
  "bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 border-orange-200",
  "bg-[#E5DEFF] hover:bg-[#E5DEFF]/90 border-purple-200",
  "bg-[#FFDEE2] hover:bg-[#FFDEE2]/90 border-pink-200",
  "bg-[#FDE1D3] hover:bg-[#FDE1D3]/90 border-peach-200",
  "bg-[#D3E4FD] hover:bg-[#D3E4FD]/90 border-blue-200"
];

export function HubDepartments({ hubId, isAdmin = false, isModerator = false }: HubDepartmentsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<HubDepartment | null>(null);
  const { toast } = useToast();

  const { data: departments, isLoading, refetch } = useQuery({
    queryKey: ['hub-departments', hubId],
    queryFn: async () => {
      if (!hubId) {
        throw new Error('Hub ID is required');
      }

      const { data, error } = await supabase
        .from('hub_departments')
        .select(`
          *,
          parent:parent_department_id(
            id,
            name
          )
        `)
        .eq('hub_id', hubId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!hubId,
  });

  const handleDelete = async (departmentId: string) => {
    try {
      const { error } = await supabase
        .from('hub_departments')
        .delete()
        .eq('id', departmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department deleted successfully"
      });

      refetch();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Error",
        description: "Failed to delete department. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (department: HubDepartment) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDepartment(null);
  };

  if (!hubId) {
    return <div>Invalid hub ID</div>;
  }

  if (isLoading) {
    return <div>Loading departments...</div>;
  }

  const canManage = isAdmin || isModerator;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Departments</h2>
        {canManage && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        )}
      </div>

      {showForm && (
        <DepartmentForm 
          hubId={hubId} 
          onSuccess={() => {
            handleFormClose();
            refetch();
          }}
          onCancel={handleFormClose}
          existingDepartment={editingDepartment || undefined}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments?.map((department, index) => (
          <Card 
            key={department.id}
            className={`transition-all duration-200 ${departmentColors[index % departmentColors.length]}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-800">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {department.name}
                </div>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(department)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the department.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(department.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            {department.description && (
              <CardContent>
                <p className="text-sm text-gray-600">
                  {department.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {departments?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No departments yet</h3>
          <p className="text-muted-foreground">Create departments to organize your institution.</p>
        </div>
      )}
    </div>
  );
}
