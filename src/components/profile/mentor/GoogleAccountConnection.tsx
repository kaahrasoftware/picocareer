import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Google } from "lucide-react";

interface GoogleAccountConnectionProps {
  profileId: string;
}

export function GoogleAccountConnection({ profileId }: GoogleAccountConnectionProps) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

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
        .single();

      if (error) throw error;
      setIsConnected(!!tokens);
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: { action: 'authorize' }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error initiating Google auth:', error);
      toast({
        title: "Error",
        description: "Failed to connect Google account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('user_oauth_tokens')
        .delete()
        .eq('user_id', profileId)
        .eq('provider', 'google');

      if (error) throw error;

      setIsConnected(false);
      toast({
        title: "Success",
        description: "Google account disconnected successfully",
      });
    } catch (error) {
      console.error('Error disconnecting Google account:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Google account. Please try again.",
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
            <Google className="h-5 w-5" />
            <span>{isConnected ? 'Connected to Google' : 'Not connected'}</span>
          </div>
          <Button
            onClick={isConnected ? handleDisconnect : handleGoogleAuth}
            variant={isConnected ? "destructive" : "default"}
          >
            {isConnected ? 'Disconnect' : 'Connect Google Account'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}