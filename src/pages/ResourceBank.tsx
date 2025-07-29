
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventResourcesSection } from "@/components/event/EventResourcesSection";
import { EventResource } from "@/types/event-resources";
import { Button } from "@/components/ui/button";
import { ResourceBankUploadDialog } from "@/components/resource-bank/ResourceBankUploadDialog";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react";

export default function ResourceBank() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.user_metadata?.user_type === 'admin';

  const { data: allResources, isLoading, error } = useQuery({
    queryKey: ['all-event-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_resources')
        .select(`
          *,
          events(
            id,
            title,
            start_time,
            organized_by
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our EventResource interface with proper defaults
      return (data || []).map(resource => ({
        ...resource,
        resource_type: resource.resource_type as EventResource['resource_type'],
        access_level: resource.access_level as EventResource['access_level'],
        view_count: resource.view_count || 0,
        download_count: resource.download_count || 0,
        unique_viewers: resource.unique_viewers || 0,
        unique_downloaders: resource.unique_downloaders || 0,
        sort_order: resource.sort_order || 0
      })) as (EventResource & { events?: { id: string; title: string; start_time: string; organized_by?: string; } })[];
    },
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Resources</h2>
          <p className="text-muted-foreground">There was an error loading the resources. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Resource Bank</h1>
            <p className="text-muted-foreground">
              Discover and access educational resources from all our events
            </p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Upload Resource
            </Button>
          )}
        </div>
      </div>

      <EventResourcesSection 
        resources={allResources || []}
      />

      {/* Upload Dialog for Admins */}
      {isAdmin && (
        <ResourceBankUploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
        />
      )}
    </div>
  );
}
