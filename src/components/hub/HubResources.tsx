
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResourceForm } from "./forms/ResourceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { HubResource } from "@/types/database/hubs";

interface HubResourcesProps {
  hubId: string;
}

export function HubResources({ hubId }: HubResourcesProps) {
  const [showForm, setShowForm] = useState(false);

  const { data: resources, isLoading } = useQuery({
    queryKey: ['hub-resources', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_resources')
        .select(`
          *,
          created_by_profile:created_by(
            first_name,
            last_name
          )
        `)
        .eq('hub_id', hubId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading resources...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resources</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {showForm && (
        <ResourceForm 
          hubId={hubId} 
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources?.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {resource.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {resource.description}
              </p>
              {resource.category && (
                <p className="text-sm text-muted-foreground mt-2">
                  Category: {resource.category}
                </p>
              )}
              {resource.created_by_profile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Added by: {resource.created_by_profile.first_name} {resource.created_by_profile.last_name}
                </p>
              )}
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                    View Resource
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
