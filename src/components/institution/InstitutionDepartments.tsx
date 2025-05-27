
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";

interface InstitutionDepartmentsProps {
  institutionId: string;
}

export function InstitutionDepartments({ institutionId }: InstitutionDepartmentsProps) {
  // Since institution_departments table doesn't exist, show placeholder
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Departments</h2>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Department (Coming Soon)
        </Button>
      </div>

      <div className="text-center py-12">
        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold mb-2">Institution departments feature is coming soon</h3>
        <p className="text-muted-foreground">This feature will be available in a future update.</p>
      </div>
    </div>
  );
}
