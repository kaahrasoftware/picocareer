
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationDialogs } from "./NotificationDialogs";
import { SessionNotificationContent } from "./SessionNotificationContent";
import { ActionButton } from "./ActionButton";
import { LoadingState } from "./LoadingState";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface NotificationContentProps {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
}

export function NotificationContent({ 
  message, 
  isExpanded, 
  type, 
  action_url 
}: NotificationContentProps) {
  const [sessionData, setSessionData] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Extract token from action URL safely
  let token = null;
  try {
    if (action_url && type === 'hub_invite') {
      const url = new URL(action_url, window.location.origin);
      token = url.searchParams.get('token');
    }
  } catch (error) {
    console.error('Error parsing action URL:', error);
  }

  const copyToken = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        setCopied(true);
        toast({
          title: "Token copied",
          description: "Verification token has been copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Please try copying the token manually",
          variant: "destructive",
        });
      }
    }
  };

  const handleAccept = () => {
    navigate(`/hub-invite?action=accept`);
  };

  if (!isExpanded) {
    return (
      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
        {message.split(/[.!?]/)[0]}
      </p>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!sessionData) {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p>{message}</p>
        {type === 'hub_invite' && token && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded">
              <code className="flex-1 font-mono text-xs">{token}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToken}
                className="h-8 px-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button 
              onClick={handleAccept}
              className="w-full"
            >
              Verify Invitation
            </Button>
          </div>
        )}
        <NotificationDialogs
          type={type}
          contentId={token!}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          majorData={null}
          careerData={null}
          blogData={null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-3">
      <SessionNotificationContent sessionData={sessionData} />
    </div>
  );
}
