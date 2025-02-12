
import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Papa from "papaparse";

interface EngagementMetricsProps {
  hubId: string;
}

export function EngagementMetrics({ hubId }: EngagementMetricsProps) {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const { data: resourceEngagement } = useQuery({
    queryKey: ['hub-resource-engagement', hubId, timeRange],
    queryFn: async () => {
      let query = supabase
        .from('hub_resource_engagement')
        .select('*')
        .eq('hub_id', hubId);

      if (timeRange !== 'all') {
        const days = parseInt(timeRange);
        query = query.gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
      }

      const { data, error } = await query;

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
    queryKey: ['hub-announcement-engagement', hubId, timeRange],
    queryFn: async () => {
      let query = supabase
        .from('hub_announcement_engagement')
        .select('*')
        .eq('hub_id', hubId);

      if (timeRange !== 'all') {
        const days = parseInt(timeRange);
        query = query.gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
      }

      const { data, error } = await query;

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

  const handleExport = async () => {
    try {
      const resourceData = resourceEngagement?.map(item => ({
        ...item,
        type: 'resource'
      }));
      
      const announcementData = announcementEngagement?.map(item => ({
        ...item,
        type: 'announcement'
      }));

      const csvData = [...(resourceData || []), ...(announcementData || [])];
      const csvString = Papa.unparse(csvData);
      
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `hub-analytics-${timeRange}-${new Date().toISOString()}.csv`;
      link.click();
      
      toast({
        title: "Export successful",
        description: "Analytics data has been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export analytics data",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

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
