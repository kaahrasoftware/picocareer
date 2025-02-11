
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
        {departments?.map((department) => (
          <Card key={department.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {department.name}
              </CardTitle>
            </CardHeader>
            {(department.description || department.parent) && (
              <CardContent>
                {department.description && (
                  <p className="text-sm text-muted-foreground">
                    {department.description}
                  </p>
                )}
                {department.parent && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Parent Department: {department.parent.name}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
