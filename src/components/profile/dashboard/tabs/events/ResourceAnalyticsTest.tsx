
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Download } from 'lucide-react';

export function ResourceAnalyticsTest() {
  const { data: testData, isLoading } = useQuery({
    queryKey: ['analytics-test'],
    queryFn: async () => {
      console.log('🧪 Testing analytics trigger implementation...');
      
      // Get resource counts from event_resources
      const { data: resources } = await supabase
        .from('event_resources')
        .select('id, title, view_count, download_count, unique_viewers, unique_downloaders');
      
      // Get interaction counts from event_resource_interactions
      const { data: interactions } = await supabase
        .from('event_resource_interactions')
        .select('resource_id, interaction_type');
      
      const resourceTotals = resources?.reduce((sum, r) => ({
        views: sum.views + (r.view_count || 0),
        downloads: sum.downloads + (r.download_count || 0)
      }), { views: 0, downloads: 0 }) || { views: 0, downloads: 0 };
      
      const interactionTotals = interactions?.reduce((sum, i) => ({
        views: sum.views + (i.interaction_type === 'view' ? 1 : 0),
        downloads: sum.downloads + (i.interaction_type === 'download' ? 1 : 0)
      }), { views: 0, downloads: 0 }) || { views: 0, downloads: 0 };
      
      const isSync = resourceTotals.views === interactionTotals.views && 
                    resourceTotals.downloads === interactionTotals.downloads;
      
      return {
        resourceTotals,
        interactionTotals,
        isSync,
        resources: resources || [],
        totalInteractions: interactions?.length || 0
      };
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading analytics test...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Analytics Trigger Test
          <Badge variant={testData?.isSync ? "default" : "destructive"}>
            {testData?.isSync ? "✅ Synced" : "❌ Out of Sync"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Resource Table Totals</h4>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{testData?.resourceTotals.views} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>{testData?.resourceTotals.downloads} downloads</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Interaction Table Totals</h4>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{testData?.interactionTotals.views} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>{testData?.interactionTotals.downloads} downloads</span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Total interactions recorded: {testData?.totalInteractions}<br/>
          Resources with data: {testData?.resources.length}
        </div>
      </CardContent>
    </Card>
  );
}
