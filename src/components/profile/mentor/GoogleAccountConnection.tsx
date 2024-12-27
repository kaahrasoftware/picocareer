import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link2 } from "lucide-react";

interface GoogleAccountConnectionProps {
  profileId: string;
}

export function GoogleAccountConnection({ profileId }: GoogleAccountConnectionProps) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    checkGoogleConnection();
  }, [profileId]);

  const checkGoogleConnection = async () => {
    try {
      const { data: tokens, error } = await supabase
        .from('user_oauth_tokens')
        .select('*')
        .eq('user_id', profileId)
        .eq('provider', 'google')
        .maybeSingle();

      if (error) throw error;
      setIsConnected(!!tokens);
    } catch (error) {
      console.error('Error checking Google connection:', error);
      toast({
        title: "Error",
        description: "Failed to check Google connection status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: { 
          action: isConnected ? 'disconnect' : 'authorize',
          userId: profileId
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else if (isConnected) {
        // Handle disconnect success
        setIsConnected(false);
        toast({
          title: "Success",
          description: "Google account disconnected successfully",
        });
      }
    } catch (error) {
      console.error('Error initiating Google auth:', error);
      toast({
        title: "Error",
        description: "Failed to process Google authentication",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Account</CardTitle>
        <CardDescription>
          Connect your Google account to enable Google Meet integration for mentorship sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            <span>{isConnected ? 'Connected to Google' : 'Not connected'}</span>
          </div>
          <Button
            onClick={handleGoogleAuth}
            variant={isConnected ? "destructive" : "default"}
          >
            {isConnected ? 'Disconnect' : 'Connect Google Account'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}