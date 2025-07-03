
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ResourceEngagement, AnnouncementEngagement } from '@/types/database/analytics';

interface EngagementMetricsProps {
  hubId: string;
}

export function EngagementMetrics({ hubId }: EngagementMetricsProps) {
  const [resourceEngagement, setResourceEngagement] = useState<ResourceEngagement[]>([]);
  const [announcementEngagement, setAnnouncementEngagement] = useState<AnnouncementEngagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEngagementData() {
      setIsLoading(true);
      try {
        // Fetch resource engagement data
        const { data: resourceData, error: resourceError } = await supabase
          .from('hub_resource_engagement')
          .select('*')
          .eq('hub_id', hubId)
          .order('view_count', { ascending: false })
          .limit(10);

        if (resourceError) throw resourceError;

        // Fetch announcement engagement data
        const { data: announcementData, error: announcementError } = await supabase
          .from('hub_announcement_engagement')
          .select('*')
          .eq('hub_id', hubId)
          .order('view_count', { ascending: false })
          .limit(10);

        if (announcementError) throw announcementError;

        // Map resource data to match ResourceEngagement interface
        const mappedResourceData: ResourceEngagement[] = (resourceData || []).map(item => ({
          resource_id: item.resource_id || item.id,
          resource_title: item.title || 'Untitled Resource',
          view_count: item.view_count || 0,
          download_count: item.download_count || 0,
          engagement_rate: item.view_count > 0 ? ((item.download_count || 0) / item.view_count * 100) : 0
        }));

        // Map announcement data to match AnnouncementEngagement interface
        const mappedAnnouncementData: AnnouncementEngagement[] = (announcementData || []).map(item => ({
          announcement_id: item.announcement_id || item.id,
          announcement_title: item.title || 'Untitled Announcement',
          view_count: item.view_count || 0,
          reaction_count: item.reaction_count || 0,
          engagement_rate: item.view_count > 0 ? ((item.reaction_count || 0) / item.view_count * 100) : 0
        }));

        setResourceEngagement(mappedResourceData);
        setAnnouncementEngagement(mappedAnnouncementData);
      } catch (error) {
        console.error("Error fetching engagement metrics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (hubId) {
      fetchEngagementData();
    }
  }, [hubId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resources">
          <TabsList>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources" className="h-[400px] pt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading resource engagement data...</p>
              </div>
            ) : resourceEngagement.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceEngagement} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="resource_title" 
                    type="category" 
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="view_count" name="Views" fill="#8884d8" />
                  <Bar dataKey="download_count" name="Downloads" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No resource engagement data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="announcements" className="h-[400px] pt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading announcement engagement data...</p>
              </div>
            ) : announcementEngagement.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={announcementEngagement} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="announcement_title" 
                    type="category" 
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="view_count" name="Views" fill="#8884d8" />
                  <Bar dataKey="reaction_count" name="Reactions" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No announcement engagement data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
