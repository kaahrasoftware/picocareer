
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventResourcesSection } from "@/components/event/EventResourcesSection";

export default function ResourceBank() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allResources, isLoading, error } = useQuery({
    queryKey: ['all-event-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_resources')
        .select(`
          *,
          events!inner(
            id,
            title,
            start_time,
            organized_by
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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
        <h1 className="text-3xl font-bold mb-2">Resource Bank</h1>
        <p className="text-muted-foreground">
          Discover and access educational resources from all our events
        </p>
      </div>

      <EventResourcesSection 
        resources={allResources || []} 
        isLoading={isLoading} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}
