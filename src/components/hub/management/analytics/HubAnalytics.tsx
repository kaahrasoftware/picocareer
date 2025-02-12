
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MemberGrowth, AnalyticsSummary } from '@/types/database/analytics';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { MemberActivityList } from './MemberActivityList';

interface HubAnalyticsProps {
  hubId: string;
}

export function HubAnalytics({ hubId }: HubAnalyticsProps) {
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowth[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalMembers: 0,
    activeMembers: 0,
    resourceCount: 0,
    announcementCount: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Fetch member growth data
        const { data: growthData, error: growthError } = await supabase
          .from('hub_member_growth')
          .select('*')
          .eq('hub_id', hubId);

        if (growthError) throw growthError;
        setMemberGrowth(growthData);

        // Fetch summary data
        const { data: members, error: membersError } = await supabase
          .from('hub_members')
          .select('id', { count: 'exact' })
          .eq('hub_id', hubId)
          .eq('status', 'Approved');

        const { data: resources, error: resourcesError } = await supabase
          .from('hub_resources')
          .select('id', { count: 'exact' })
          .eq('hub_id', hubId);

        const { data: announcements, error: announcementsError } = await supabase
          .from('hub_announcements')
          .select('id', { count: 'exact' })
          .eq('hub_id', hubId);

        if (membersError || resourcesError || announcementsError) 
          throw membersError || resourcesError || announcementsError;

        setSummary({
          totalMembers: members?.length || 0,
          activeMembers: members?.length || 0, // This will be updated with actual active count
          resourceCount: resources?.length || 0,
          announcementCount: announcements?.length || 0
        });

      } catch (error: any) {
        toast({
          title: "Error fetching analytics",
          description: error.message,
          variant: "destructive"
        });
      }
    }

    fetchAnalytics();
  }, [hubId, toast]);

  return (
    <div className="space-y-6">
      <AnalyticsSummaryCards summary={summary} />
      
      <Tabs defaultValue="growth" className="w-full">
        <TabsList>
          <TabsTrigger value="growth">Member Growth</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Member Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    }}
                  />
                  <Bar dataKey="new_members" fill="#8884d8" name="New Members" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <MemberActivityList hubId={hubId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
