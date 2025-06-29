
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationContent } from './notification-details/NotificationContent';
import { NotificationActions } from './notification-details/NotificationActions';
import { NotificationHeader } from './notification-details/NotificationHeader';
import { NotificationDialogs } from './notification-details/NotificationDialogs';
import { useNotificationData } from './notification-details/hooks/useNotificationData';
import type { Notification } from './NotificationPanel';

interface NotificationDetailsDialogProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleRead: (notification: Notification) => void;
  onDelete: (notificationId: string) => void;
}

function getSessionIdFromActionUrl(actionUrl: string): string | null {
  try {
    // Handle different URL patterns for session notifications
    const patterns = [
      /\/sessions\/([a-f0-9-]{36})/i,  // /sessions/{session-id}
      /sessionId=([a-f0-9-]{36})/i,    // ?sessionId={session-id}
      /session\/([a-f0-9-]{36})/i,     // /session/{session-id}
    ];
    
    for (const pattern of patterns) {
      const match = actionUrl.match(pattern);
      if (match && match[1]) {
        console.log('Session ID extracted:', match[1], 'from URL:', actionUrl);
        return match[1];
      }
    }
    
    console.log('No session ID found in URL:', actionUrl);
    return null;
  } catch (error) {
    console.error('Error extracting session ID from URL:', actionUrl, error);
    return null;
  }
}

export function NotificationDetailsDialog({
  notification,
  open,
  onOpenChange,
  onToggleRead,
  onDelete
}: NotificationDetailsDialogProps) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { majorData, careerData, blogData } = useNotificationData(
    notification?.type,
    notification?.metadata?.content_id
  );

  // Extract session ID from action URL for session-related notifications
  const sessionId = notification?.action_url ? getSessionIdFromActionUrl(notification.action_url) : null;
  
  // Query session details if we have a session ID
  const { data: sessionDetails, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ['session-details', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      console.log('Querying session details for ID:', sessionId);
      
      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          scheduled_at,
          status,
          notes,
          mentor:profiles!mentor_sessions_mentor_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          mentee:profiles!mentor_sessions_mentee_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          session_type:mentor_session_types!mentor_sessions_session_type_id_fkey(
            type,
            duration
          )
        `)
        .eq('id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching session details:', error);
        throw error;
      }

      console.log('Session details fetched:', data);
      return data;
    },
    enabled: !!sessionId,
    retry: 2,
    staleTime: 30000
  });

  if (!notification) return null;

  const isSessionNotification = notification.type?.includes('session') || sessionId;
  const sessionDate = sessionDetails?.scheduled_at ? new Date(sessionDetails.scheduled_at).toISOString().split('T')[0] : null;

  // Debug logging
  console.log('Debug Info:', {
    'Session ID': sessionId || 'Not found',
    'Loading': sessionLoading ? 'Yes' : 'No',
    'Session Date': sessionDate || 'Not available',
    'Error': sessionError ? sessionError.message : 'No',
    'Action URL': notification.action_url
  });

  const handleViewSession = async () => {
    if (!sessionDetails) {
      console.error('No session details available for navigation');
      return;
    }

    try {
      const sessionDate = new Date(sessionDetails.scheduled_at).toISOString().split('T')[0];
      console.log('Navigating to calendar with session date:', sessionDate);
      
      // Close the notification dialog first
      onOpenChange(false);
      
      // Navigate to the calendar with the specific date
      navigate(`/profile?tab=calendar&date=${sessionDate}`);
    } catch (error) {
      console.error('Error navigating to session date:', error);
      // Fallback to current date
      onOpenChange(false);
      navigate('/profile?tab=calendar');
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'session_booked':
      case 'session_reminder':
        return 'bg-blue-100 text-blue-800';
      case 'session_cancelled':
        return 'bg-red-100 text-red-800';
      case 'session_completed':
        return 'bg-green-100 text-green-800';
      case 'hub_membership':
      case 'hub_invite':
        return 'bg-purple-100 text-purple-800';
      case 'reward':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-lg font-semibold mb-2 pr-4">
                  {notification.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getNotificationTypeColor(notification.type)}>
                    {notification.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <NotificationContent notification={notification} />

            {/* Session-specific actions */}
            {isSessionNotification && (
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={handleViewSession}
                  disabled={sessionLoading || !sessionDetails}
                  className="flex-1"
                >
                  {sessionLoading ? 'Loading Session...' : 'View Session'}
                </Button>
              </div>
            )}

            {/* General notification actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onToggleRead(notification)}
                size="sm"
              >
                Mark as {notification.read ? 'Unread' : 'Read'}
              </Button>
              
              <div className="flex gap-2">
                {(notification.type === 'major_update' || 
                  notification.type === 'career_update' || 
                  notification.type === 'blog_update') && (
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(true)}
                    size="sm"
                  >
                    View Details
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete(notification.id);
                    onOpenChange(false);
                  }}
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NotificationDialogs
        type={notification?.type}
        contentId={notification?.metadata?.content_id}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        majorData={majorData}
        careerData={careerData}
        blogData={blogData}
      />
    </>
  );
}
