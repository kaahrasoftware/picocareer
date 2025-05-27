
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResourceTracking } from '@/hooks/useResourceTracking';
import { supabase } from '@/integrations/supabase/client';

export function ResourceTrackingDebug() {
  const [testResourceId, setTestResourceId] = useState('');
  const [lastInteractionId, setLastInteractionId] = useState<string | null>(null);
  const { trackView, trackDownload, isTracking } = useResourceTracking();

  const handleTestView = () => {
    if (!testResourceId) return;
    console.log('🧪 Testing view tracking for resource:', testResourceId);
    trackView(testResourceId, { test: true, timestamp: Date.now() });
  };

  const handleTestDownload = () => {
    if (!testResourceId) return;
    console.log('🧪 Testing download tracking for resource:', testResourceId);
    trackDownload(testResourceId, { test: true, timestamp: Date.now() });
  };

  const checkLastInteraction = async () => {
    try {
      const { data, error } = await supabase
        .from('event_resource_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching last interaction:', error);
        return;
      }

      console.log('Last interaction:', data);
      setLastInteractionId(data?.id || null);
    } catch (error) {
      console.error('Error checking last interaction:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Resource Tracking Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="resource-id" className="block text-sm font-medium mb-1">
            Test Resource ID:
          </label>
          <input
            id="resource-id"
            type="text"
            value={testResourceId}
            onChange={(e) => setTestResourceId(e.target.value)}
            placeholder="Enter a resource ID to test"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleTestView} 
            disabled={!testResourceId || isTracking}
            size="sm"
          >
            Test View
          </Button>
          <Button 
            onClick={handleTestDownload} 
            disabled={!testResourceId || isTracking}
            size="sm"
          >
            Test Download
          </Button>
        </div>
        
        <Button onClick={checkLastInteraction} variant="outline" size="sm">
          Check Last Interaction
        </Button>
        
        {lastInteractionId && (
          <p className="text-sm text-green-600">
            Last interaction ID: {lastInteractionId}
          </p>
        )}
        
        {isTracking && (
          <p className="text-sm text-blue-600">Tracking in progress...</p>
        )}
      </CardContent>
    </Card>
  );
}
