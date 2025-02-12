
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HubAnalytics } from '@/types/database/analytics';
import { ScrollArea } from "@/components/ui/scroll-area";

interface MemberActivityListProps {
  hubId: string;
}

export function MemberActivityList({ hubId }: MemberActivityListProps) {
  const [activities, setActivities] = useState<HubAnalytics[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchActivities() {
      try {
        const { data, error } = await supabase
          .from('hub_analytics')
          .select('*')
          .eq('hub_id', hubId)
          .eq('metric_type', 'member_activity')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setActivities(data || []);
      } catch (error: any) {
        toast({
          title: "Error fetching activities",
          description: error.message,
          variant: "destructive"
        });
      }
    }

    fetchActivities();
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('hub_analytics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hub_analytics',
          filter: `hub_id=eq.${hubId}`
        },
        (payload) => {
          if (payload.new) {
            setActivities(current => [payload.new as HubAnalytics, ...current].slice(0, 50));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [hubId, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {activity.metric_value.action === 'INSERT' ? 'New member joined' : 'Member updated'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
