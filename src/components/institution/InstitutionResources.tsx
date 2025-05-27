
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";

interface InstitutionResourcesProps {
  institutionId: string;
}

export function InstitutionResources({ institutionId }: InstitutionResourcesProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resources</h2>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource (Coming Soon)
        </Button>
      </div>

      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold mb-2">Institution resources feature is coming soon</h3>
        <p className="text-muted-foreground">Resources shared by the institution will appear here.</p>
      </div>
    </div>
  );
}
