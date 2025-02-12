
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ResourceEngagement, AnnouncementEngagement } from "@/types/database/analytics";

interface EngagementMetricsProps {
  hubId: string;
}

export function EngagementMetrics({ hubId }: EngagementMetricsProps) {
  const { toast } = useToast();

  const { data: resourceEngagement } = useQuery({
    queryKey: ['hub-resource-engagement', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_resource_engagement')
        .select('*')
        .eq('hub_id', hubId);

      if (error) {
        toast({
          title: "Error fetching resource engagement",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      return data as ResourceEngagement[];
    }
  });

  const { data: announcementEngagement } = useQuery({
    queryKey: ['hub-announcement-engagement', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_announcement_engagement')
        .select('*')
        .eq('hub_id', hubId);

      if (error) {
        toast({
          title: "Error fetching announcement engagement",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      return data as AnnouncementEngagement[];
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resource Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="view_count" name="Views" fill="#8884d8" />
                <Bar dataKey="download_count" name="Downloads" fill="#82ca9d" />
                <Bar dataKey="share_count" name="Shares" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcement Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={announcementEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="view_count" name="Views" fill="#8884d8" />
                <Bar dataKey="reaction_count" name="Reactions" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
