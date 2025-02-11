
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HubContentManagementProps {
  hubId: string;
}

export function HubContentManagement({ hubId }: HubContentManagementProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch hub content (announcements and resources)
  const { data: content, isLoading: isLoadingContent } = useQuery({
    queryKey: ['hub-content', hubId],
    queryFn: async () => {
      const [announcementsResponse, resourcesResponse] = await Promise.all([
        supabase
          .from('hub_announcements')
          .select('*')
          .eq('hub_id', hubId)
          .order('created_at', { ascending: false }),
        supabase
          .from('hub_resources')
          .select('*')
          .eq('hub_id', hubId)
          .order('created_at', { ascending: false })
      ]);

      return {
        announcements: announcementsResponse.data || [],
        resources: resourcesResponse.data || []
      };
    }
  });

  if (isLoadingContent) {
    return <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content?.announcements.map((announcement) => (
              <div key={announcement.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{announcement.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content?.resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(resource.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
