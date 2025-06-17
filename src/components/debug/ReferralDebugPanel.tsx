
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

export function ReferralDebugPanel() {
  const { session } = useAuthSession();
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testUserId, setTestUserId] = useState('');

  const debugReferralStatus = async () => {
    if (!testUserId && !session?.user?.id) {
      return;
    }

    setIsLoading(true);
    try {
      const userId = testUserId || session?.user?.id;
      const { data, error } = await supabase.rpc('debug_referral_status', {
        p_user_id: userId
      });

      if (error) throw error;
      setDebugResult(data);
    } catch (error) {
      console.error('Debug error:', error);
      setDebugResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show for admin users or in development
  if (!session?.user || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Referral Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="User ID (leave empty for current user)"
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
          />
          <Button onClick={debugReferralStatus} disabled={isLoading}>
            {isLoading ? "Checking..." : "Debug Status"}
          </Button>
        </div>
        
        {debugResult && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Results:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
