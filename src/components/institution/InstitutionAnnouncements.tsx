
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InstitutionAnnouncement } from "@/types/database/institutions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface InstitutionAnnouncementsProps {
  institutionId: string;
}

export function InstitutionAnnouncements({ institutionId }: InstitutionAnnouncementsProps) {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['institution-announcements', institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institution_announcements')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InstitutionAnnouncement[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <div className="space-y-4">
        {announcements?.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Megaphone className="h-5 w-5 flex-shrink-0 mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle>{announcement.title}</CardTitle>
                    <Badge variant="outline">{announcement.category}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{announcement.content}</p>
            </CardContent>
          </Card>
        ))}

        {announcements?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
            <p className="text-muted-foreground">Important announcements will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
