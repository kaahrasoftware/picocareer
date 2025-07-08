import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function AuthDebug() {
  const { user, session, loading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [testResult, setTestResult] = useState<string>("");
  const { toast } = useToast();

  const testAPIConnection = async () => {
    try {
      setTestResult("Testing API connection...");
      
      const { data, error } = await supabase.functions.invoke('api-organizations', {
        method: 'GET',
      });
      
      if (error) {
        setTestResult(`Error: ${JSON.stringify(error, null, 2)}`);
        toast({
          title: "API Test Failed",
          description: error.message || "Unknown error",
          variant: "destructive",
        });
      } else {
        setTestResult(`Success: Retrieved ${Array.isArray(data) ? data.length : 'unknown'} organizations`);
        toast({
          title: "API Test Successful",
          description: "API connection is working",
        });
      }
    } catch (error) {
      setTestResult(`Exception: ${error.message}`);
      toast({
        title: "API Test Exception",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Authentication Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Authentication Status:</strong>
            <Badge variant={user ? "default" : "destructive"} className="ml-2">
              {loading ? "Loading..." : user ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </div>
          
          <div>
            <strong>Admin Status:</strong>
            <Badge variant={isAdmin ? "default" : "secondary"} className="ml-2">
              {adminLoading ? "Checking..." : isAdmin ? "Admin" : "Not Admin"}
            </Badge>
          </div>
        </div>

        {user && (
          <div className="space-y-2">
            <div><strong>User ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</div>
          </div>
        )}

        {session && (
          <div className="space-y-2">
            <div><strong>Token Expires:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</div>
            <div><strong>Access Token (first 20 chars):</strong> {session.access_token.substring(0, 20)}...</div>
          </div>
        )}

        <div className="space-y-2">
          <Button onClick={testAPIConnection} disabled={!user || !isAdmin}>
            Test API Connection
          </Button>
          {testResult && (
            <div className="mt-2 p-2 bg-muted rounded text-sm">
              <pre className="whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>

        {!user && (
          <div className="text-sm text-muted-foreground">
            Please sign in to test API functionality
          </div>
        )}

        {user && !isAdmin && (
          <div className="text-sm text-muted-foreground">
            Admin access required to test API functionality
          </div>
        )}
      </CardContent>
    </Card>
  );
}