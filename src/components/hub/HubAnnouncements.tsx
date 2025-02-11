
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementForm } from "./forms/AnnouncementForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Megaphone, Plus } from "lucide-react";
import { HubAnnouncement } from "@/types/database/hubs";

interface HubAnnouncementsProps {
  hubId: string;
}

export function HubAnnouncements({ hubId }: HubAnnouncementsProps) {
  const [showForm, setShowForm] = useState(false);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['hub-announcements', hubId],
    queryFn: async () => {
      // First fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('hub_announcements')
        .select('*')
        .eq('hub_id', hubId)
        .order('created_at', { ascending: false });

      if (announcementsError) throw announcementsError;

      // Then fetch creator profiles separately
      const creatorIds = announcementsData.map(a => a.created_by).filter(Boolean);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', creatorIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const profileMap = new Map(profilesData?.map(p => [p.id, p]));
      
      return announcementsData.map(announcement => ({
        ...announcement,
        created_by_profile: profileMap.get(announcement.created_by) || null
      }));
    },
  });

  if (isLoading) {
    return <div>Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Announcements</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Announcement
        </Button>
      </div>

      {showForm && (
        <AnnouncementForm 
          hubId={hubId} 
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="space-y-4">
        {announcements?.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  {announcement.title}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{announcement.content}</p>
              {announcement.created_by_profile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Posted by: {announcement.created_by_profile.first_name} {announcement.created_by_profile.last_name}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
