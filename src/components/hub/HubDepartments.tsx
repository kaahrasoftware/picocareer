
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepartmentForm } from "./forms/DepartmentForm";
import { DepartmentGrid } from "./departments/DepartmentGrid";
import { useDepartments } from "./departments/useDepartments";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HubDepartment } from "@/types/database/hubs";

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

  const { data: departments, isLoading, refetch } = useDepartments(hubId);

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

      <DepartmentGrid
        departments={departments || []}
        departmentColors={departmentColors}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canManage={canManage}
      />
    </div>
  );
}
