
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InstitutionResource } from "@/types/database/institutions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InstitutionResourcesProps {
  institutionId: string;
}

export function InstitutionResources({ institutionId }: InstitutionResourcesProps) {
  const { data: resources, isLoading } = useQuery({
    queryKey: ['institution-resources', institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institution_resources')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InstitutionResource[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resources</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources?.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <CardTitle className="flex items-start gap-2">
                <FileText className="h-5 w-5 flex-shrink-0" />
                <span className="line-clamp-2">{resource.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {resource.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {resources?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
          <p className="text-muted-foreground">Resources shared by the institution will appear here.</p>
        </div>
      )}
    </div>
  );
}
