
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MentorContentList } from "../content/MentorContentList";
import { MentorContentFilters } from "../content/MentorContentFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddContentDialog } from "../content/AddContentDialog";
import { MentorStorageStats } from "../content/MentorStorageStats";
import { useAuthSession } from "@/hooks/useAuthSession";

interface ProfileContentTabProps {
  profileId: string;
}

export function ProfileContentTab({ profileId }: ProfileContentTabProps) {
  const [contentType, setContentType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({ from: undefined, to: undefined });
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();
  const isCurrentUserProfile = session?.user?.id === profileId;

  // Fetch mentor content
  const { data: contentItems, isLoading, refetch } = useQuery({
    queryKey: ['mentor-content', profileId, contentType, dateRange, searchQuery],
    queryFn: async () => {
      // Start with base query
      let query = supabase
        .from('mentor_content')
        .select('*')
        .eq('mentor_id', profileId)
        .order('created_at', { ascending: false });

      // Add filters if they exist
      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      if (dateRange.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }

      if (dateRange.to) {
        // Add one day to include the end date in the range
        const endDate = new Date(dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Only show published content for other users
      if (!isCurrentUserProfile) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching content:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profileId,
  });

  // Fetch storage metrics
  const { data: storageMetrics } = useQuery({
    queryKey: ['mentor-storage-metrics', profileId],
    queryFn: async () => {
      if (!isCurrentUserProfile) return null;
      
      const { data, error } = await supabase
        .from('mentor_storage_metrics')
        .select('*')
        .eq('mentor_id', profileId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error fetching storage metrics:", error);
      }

      return data || { 
        total_storage_bytes: 0, 
        file_count: 0 
      };
    },
    enabled: !!profileId && isCurrentUserProfile,
  });

  const handleContentAdded = () => {
    refetch();
    toast({
      title: "Content added",
      description: "Your content has been successfully added.",
    });
    setShowAddDialog(false);
  };

  return (
    <ScrollArea className="h-full">
      <div className="px-1 sm:px-2 py-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <MentorContentFilters 
            contentType={contentType}
            setContentType={setContentType}
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {isCurrentUserProfile && (
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="flex-shrink-0"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Content
            </Button>
          )}
        </div>

        {isCurrentUserProfile && storageMetrics && (
          <MentorStorageStats metrics={storageMetrics} />
        )}

        <MentorContentList 
          contentItems={contentItems || []} 
          isLoading={isLoading} 
          isOwner={isCurrentUserProfile}
          onRefresh={refetch}
        />
      </div>

      {isCurrentUserProfile && (
        <AddContentDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
          profileId={profileId}
          onContentAdded={handleContentAdded}
        />
      )}
    </ScrollArea>
  );
}
