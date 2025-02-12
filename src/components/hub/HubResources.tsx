
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResourceForm } from "./forms/ResourceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Image, Video, Music, Link2, File } from "lucide-react";
import { HubResource } from "@/types/database/hubs";

interface HubResourcesProps {
  hubId: string;
}

const getResourceIcon = (resource: HubResource) => {
  switch (resource.resource_type) {
    case 'document':
      return <FileText className="h-5 w-5" />;
    case 'image':
      return <Image className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'audio':
      return <Music className="h-5 w-5" />;
    case 'external_link':
      return <Link2 className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
};

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

  const getResourceUrl = (resource: HubResource) => {
    return resource.resource_type === 'external_link' ? resource.external_url : resource.file_url;
  };

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
                {getResourceIcon(resource)}
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
              {resource.document_type && (
                <p className="text-sm text-muted-foreground mt-2">
                  Type: {resource.document_type}
                </p>
              )}
              {resource.created_by_profile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Added by: {resource.created_by_profile.first_name} {resource.created_by_profile.last_name}
                </p>
              )}
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <a href={getResourceUrl(resource)} target="_blank" rel="noopener noreferrer">
                    {resource.resource_type === 'external_link' ? 'Visit Link' : 'View Resource'}
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
