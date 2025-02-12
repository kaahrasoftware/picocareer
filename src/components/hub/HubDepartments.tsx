
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentForm } from "./forms/DepartmentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Plus } from "lucide-react";
import { HubDepartment } from "@/types/database/hubs";

interface HubDepartmentsProps {
  hubId: string;
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

export function HubDepartments({ hubId }: HubDepartmentsProps) {
  const [showForm, setShowForm] = useState(false);

  const { data: departments, isLoading } = useQuery({
    queryKey: ['hub-departments', hubId],
    queryFn: async () => {
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
  });

  if (isLoading) {
    return <div>Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Departments</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {showForm && (
        <DepartmentForm 
          hubId={hubId} 
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments?.map((department, index) => (
          <Card 
            key={department.id}
            className={`transition-all duration-200 ${departmentColors[index % departmentColors.length]}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Building className="h-5 w-5" />
                {department.name}
              </CardTitle>
            </CardHeader>
            {(department.description || department.parent) && (
              <CardContent>
                {department.description && (
                  <p className="text-sm text-gray-600">
                    {department.description}
                  </p>
                )}
                {department.parent && (
                  <p className="text-sm text-gray-600 mt-2">
                    Parent Department: {department.parent.name}
                  </p>
                )}
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
