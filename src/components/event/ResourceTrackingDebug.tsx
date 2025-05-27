
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Eye, Download, RefreshCw, Database } from 'lucide-react';

interface ResourceInteraction {
  id: string;
  resource_id: string;
  profile_id: string | null;
  interaction_type: string;
  created_at: string;
  metadata: any;
}

interface ResourceStats {
  id: string;
  title: string;
  view_count: number;
  download_count: number;
  unique_viewers: number;
  unique_downloaders: number;
}

export function ResourceTrackingDebug({ resourceId }: { resourceId: string }) {
  const [interactions, setInteractions] = useState<ResourceInteraction[]>([]);
  const [resourceStats, setResourceStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  const fetchTrackingData = async () => {
    if (!resourceId) return;
    
    setLoading(true);
    try {
      // Fetch recent interactions for this resource
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('event_resource_interactions')
        .select('*')
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (interactionsError) {
        console.error('Error fetching interactions:', interactionsError);
      } else {
        setInteractions(interactionsData || []);
      }

      // Fetch resource stats
      const { data: statsData, error: statsError } = await supabase
        .from('event_resources')
        .select('id, title, view_count, download_count, unique_viewers, unique_downloaders')
        .eq('id', resourceId)
        .single();

      if (statsError) {
        console.error('Error fetching resource stats:', statsError);
      } else {
        setResourceStats(statsData);
      }
    } catch (error) {
      console.error('Error in fetchTrackingData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, [resourceId]);

  if (!session?.user) {
    return (
      <Card className="mt-4 border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <p className="text-sm text-orange-700">
            Sign in to view tracking debug information
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Resource Tracking Debug
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrackingData}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resource Stats */}
        {resourceStats && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Stats</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-blue-600" />
                <span className="text-xs">Views: {resourceStats.view_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3 text-green-600" />
                <span className="text-xs">Downloads: {resourceStats.download_count}</span>
              </div>
              <div className="text-xs text-gray-600">
                Unique Viewers: {resourceStats.unique_viewers}
              </div>
              <div className="text-xs text-gray-600">
                Unique Downloads: {resourceStats.unique_downloaders}
              </div>
            </div>
          </div>
        )}

        {/* Recent Interactions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Interactions ({interactions.length})</h4>
          {interactions.length === 0 ? (
            <p className="text-xs text-gray-500">No interactions recorded yet</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="text-xs border rounded p-2 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={interaction.interaction_type === 'view' ? 'secondary' : 'default'}>
                      {interaction.interaction_type}
                    </Badge>
                    <span className="text-gray-500">
                      {new Date(interaction.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    User: {interaction.profile_id ? 'Authenticated' : 'Anonymous'}
                  </div>
                  {interaction.metadata?.source && (
                    <div className="text-gray-600">
                      Source: {interaction.metadata.source}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t">
          Resource ID: {resourceId}
        </div>
      </CardContent>
    </Card>
  );
}
