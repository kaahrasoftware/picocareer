
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InstitutionDepartment } from "@/types/database/institutions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InstitutionDepartmentsProps {
  institutionId: string;
}

export function InstitutionDepartments({ institutionId }: InstitutionDepartmentsProps) {
  const { data: departments, isLoading } = useQuery({
    queryKey: ['institution-departments', institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institution_departments')
        .select('*')
        .eq('institution_id', institutionId)
        .order('name');

      if (error) throw error;
      return data as InstitutionDepartment[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Departments</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments?.map((department) => (
          <Card key={department.id}>
            <CardHeader>
              <CardTitle className="flex items-start gap-2">
                <Building2 className="h-5 w-5 flex-shrink-0" />
                <span>{department.name}</span>
              </CardTitle>
            </CardHeader>
            {department.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
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
