
import { FC, useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { supabase } from "@/integrations/supabase/client";

interface NotificationContentProps {
  notification: {
    message?: string;
    type?: string;
    action_url?: string;
    id: string;
  };
  isExpanded: boolean;
}

// Enhanced session ID extraction function to handle multiple URL patterns
const getSessionIdFromActionUrl = (actionUrl: string): string | null => {
  if (!actionUrl) {
    console.log('No action URL provided');
    return null;
  }

  console.log('Extracting session ID from URL:', actionUrl);

  // Pattern 1: /sessions/SESSION_ID (for booking confirmations)
  const sessionPathMatch = actionUrl.match(/\/sessions\/([a-f0-9-]{36})/i);
  if (sessionPathMatch) {
    console.log('Session ID found in path pattern:', sessionPathMatch[1]);
    return sessionPathMatch[1];
  }

  // Pattern 2: feedbackSession=SESSION_ID (for feedback requests)
  const feedbackParamMatch = actionUrl.match(/feedbackSession=([a-f0-9-]{36})/i);
  if (feedbackParamMatch) {
    console.log('Session ID found in feedback parameter:', feedbackParamMatch[1]);
    return feedbackParamMatch[1];
  }

  console.log('No valid session ID pattern found in URL');
  return null;
};

// Function to fetch session date from database
const fetchSessionDate = async (sessionId: string): Promise<string | null> => {
  try {
    console.log('Fetching session date for ID:', sessionId);
    
    const { data: sessionData, error } = await supabase
      .from('mentor_sessions')
      .select('scheduled_at')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching session date:', error);
      return null;
    }

    if (sessionData?.scheduled_at) {
      // Format the date as YYYY-MM-DD for URL parameter
      const sessionDate = new Date(sessionData.scheduled_at);
      const formattedDate = sessionDate.toISOString().split('T')[0];
      console.log('Session date fetched and formatted:', formattedDate);
      return formattedDate;
    }

    return null;
  } catch (error) {
    console.error('Error fetching session date:', error);
    return null;
  }
};

export const NotificationContent: FC<NotificationContentProps> = ({
  notification,
  isExpanded
}) => {
  const { message = '', type, action_url, id } = notification;
  const [sessionDate, setSessionDate] = useState<string | null>(null);
  const [isLoadingSessionDate, setIsLoadingSessionDate] = useState(false);

  // Define the truncated length based on notification type
  const getTruncatedLength = () => {
    if (type === 'session_booking' || type === 'hub_invitation') return 100;
    return 75; // Default for other notification types
  };

  // Get initial message display length
  const truncateLength = getTruncatedLength();
  
  // Sanitize the message HTML content
  const sanitizedMessage = sanitizeHtml(message);
  
  // For collapsed state, show truncated message without HTML
  const plainTextMessage = message.replace(/<[^>]*>/g, '');
  const truncatedMessage = plainTextMessage.length > truncateLength && !isExpanded
    ? `${plainTextMessage.substring(0, truncateLength)}...`
    : plainTextMessage;

  // Effect to fetch session date when component mounts and is expanded
  useEffect(() => {
    if (action_url && isExpanded) {
      const sessionId = getSessionIdFromActionUrl(action_url);
      if (sessionId) {
        setIsLoadingSessionDate(true);
        fetchSessionDate(sessionId).then((date) => {
          setSessionDate(date);
          setIsLoadingSessionDate(false);
        });
      }
    }
  }, [action_url, isExpanded]);

  return (
    <div className="mt-2 mb-2">
      {isExpanded ? (
        // When expanded, show full message with HTML
        <div 
          className="notification-message text-sm text-gray-700" 
          dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
        />
      ) : (
        // When collapsed, show truncated plain text
        <p className="text-sm text-gray-700">
          {truncatedMessage}
        </p>
      )}
      
      {action_url && isExpanded && (
        <div className="mt-3">
          {action_url.startsWith('/') ? (
            // Internal link - check if it's a session-related URL for special handling
            (() => {
              const sessionId = getSessionIdFromActionUrl(action_url);
              if (sessionId) {
                // For session notifications, redirect to calendar with session date
                if (isLoadingSessionDate) {
                  return (
                    <Button variant="outline" size="sm" className="rounded-full text-xs" disabled>
                      Loading...
                    </Button>
                  );
                }
                
                if (sessionDate) {
                  return (
                    <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
                      <Link to={`/profile?tab=calendar&date=${sessionDate}`}>
                        View Session
                      </Link>
                    </Button>
                  );
                } else {
                  // Fallback to original URL if session date fetch failed
                  return (
                    <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
                      <Link to={action_url}>
                        View Session
                      </Link>
                    </Button>
                  );
                }
              } else {
                // Regular internal link
                return (
                  <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
                    <Link to={action_url}>
                      View Details
                    </Link>
                  </Button>
                );
              }
            })()
          ) : (
            // External link
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
              <a href={action_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                Open Link <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
