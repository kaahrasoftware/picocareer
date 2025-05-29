
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HubRecommendationsProps {
  hubId: string;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
}

export function HubRecommendations({ hubId }: HubRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function analyzeAndGenerateRecommendations() {
      setIsLoading(true);
      try {
        // Get hub metrics
        const { data: metrics, error: metricsError } = await supabase
          .from('hub_storage_metrics')
          .select('*')
          .eq('hub_id', hubId)
          .single();

        if (metricsError) throw metricsError;

        // Get member metrics
        const { data: memberMetrics, error: memberError } = await supabase
          .from('hub_member_metrics')
          .select('*')
          .eq('hub_id', hubId)
          .single();

        if (memberError) throw memberError;

        // Generate recommendations based on metrics
        const newRecommendations: Recommendation[] = [];

        // Check if content is low
        if (metrics.resources_count < 5) {
          newRecommendations.push({
            type: 'content',
            title: 'Add More Resources',
            description: 'Your hub has few resources. Adding more content will increase engagement.',
            actionLabel: 'Add Resource',
            actionPath: `/hubs/${hubId}/resources/new`
          });
        }

        // Check if member count is low compared to limit
        if (memberMetrics.active_members < memberMetrics.member_limit * 0.25) {
          newRecommendations.push({
            type: 'members',
            title: 'Invite More Members',
            description: 'Your hub has relatively few members. Consider inviting more people to join.',
            actionLabel: 'Invite Members',
            actionPath: `/hubs/${hubId}/members/invite`
          });
        }

        // Check if announcements are low
        if (metrics.announcements_count < 3) {
          newRecommendations.push({
            type: 'announcements',
            title: 'Create More Announcements',
            description: 'Regular announcements help keep members engaged and informed.',
            actionLabel: 'Create Announcement',
            actionPath: `/hubs/${hubId}/announcements/new`
          });
        }

        setRecommendations(newRecommendations);
      } catch (error) {
        console.error("Error generating recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (hubId) {
      analyzeAndGenerateRecommendations();
    }
  }, [hubId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hub Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Analyzing hub data and generating recommendations...</p>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium">{rec.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  size="sm"
                  onClick={() => navigate(rec.actionPath)}
                >
                  {rec.actionLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium">Your hub is doing well!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We don't have any specific recommendations at this time. Keep up the good work!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
