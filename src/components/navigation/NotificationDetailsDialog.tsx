import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Trash2, ExternalLink, CheckCircle, Circle, Calendar, Users } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { Notification } from './NotificationPanel';

interface NotificationDetailsDialogProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleRead: (notification: Notification) => void;
  onDelete: (notificationId: string) => void;
}

export function NotificationDetailsDialog({
  notification,
  open,
  onOpenChange,
  onToggleRead,
  onDelete
}: NotificationDetailsDialogProps) {
  const navigate = useNavigate();

  // Enhanced session ID extraction with better debugging
  const getSessionIdFromActionUrl = (actionUrl: string): string | null => {
    console.log('🔍 Extracting session ID from URL:', actionUrl);
    
    try {
      const url = new URL(actionUrl, window.location.origin);
      const sessionId = url.searchParams.get('feedbackSession');
      
      console.log('📝 Extracted session ID:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('❌ Error parsing action URL:', error);
      return null;
    }
  };

  // Extract session ID from action URL for session notifications
  const sessionId = notification?.action_url ? getSessionIdFromActionUrl(notification.action_url) : null;
  
  console.log('🎯 Current notification:', {
    id: notification?.id,
    type: notification?.type,
    action_url: notification?.action_url,
    extracted_session_id: sessionId
  });

  // Fetch session details when needed with enhanced error handling
  const { data: sessionDetails, isLoading: isSessionLoading, error: sessionError } = useQuery({
    queryKey: ['session-details', sessionId],
    queryFn: async () => {
      if (!sessionId) {
        console.log('⚠️ No session ID found, skipping query');
        return null;
      }
      
      console.log('🔄 Fetching session details for ID:', sessionId);
      
      const { data, error } = await supabase
        .from('mentor_sessions')
        .select('id, scheduled_at, mentor_id, mentee_id')
        .eq('id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching session details:', error);
        return null;
      }
      
      console.log('✅ Session details fetched:', data);
      return data;
    },
    enabled: !!sessionId && (notification?.type === 'session_booked' || notification?.type === 'session_reminder'),
  });

  if (!notification) return null;

  const handleToggleRead = () => {
    onToggleRead(notification);
  };

  const handleDelete = () => {
    onDelete(notification.id);
    onOpenChange(false);
  };

  const handleActionUrl = async () => {
    if (!notification.action_url) return;
    
    console.log('🚀 Handling action URL click for notification:', notification.type);
    
    // Handle session-related notifications with proper data loading
    if (notification.type === 'session_booked' || notification.type === 'session_reminder') {
      console.log('📅 Processing session notification');
      console.log('Session loading state:', isSessionLoading);
      console.log('Session details:', sessionDetails);
      console.log('Session error:', sessionError);
      
      // Wait for session data if it's still loading
      if (isSessionLoading) {
        console.log('⏳ Session data still loading, waiting...');
        return; // Don't navigate while loading
      }
      
      let targetDate;
      
      if (sessionDetails?.scheduled_at) {
        // Use the actual session date if available
        targetDate = format(new Date(sessionDetails.scheduled_at), 'yyyy-MM-dd');
        console.log('✅ Using session date:', targetDate);
      } else {
        // Fallback to current date if session details aren't available
        targetDate = format(new Date(), 'yyyy-MM-dd');
        console.log('⚠️ Session details not found, using current date as fallback:', targetDate);
        
        // Log additional debug info
        console.log('Debug info:', {
          sessionId,
          sessionDetails,
          sessionError,
          isSessionLoading,
          notificationType: notification.type
        });
      }
      
      const navigationUrl = `/profile?tab=calendar&date=${targetDate}`;
      console.log('🎯 Navigating to:', navigationUrl);
      
      navigate(navigationUrl);
      onOpenChange(false);
      return;
    }
    
    if (notification.action_url.startsWith('/')) {
      // Internal route - use React Router
      navigate(notification.action_url);
      onOpenChange(false);
    } else {
      // External URL - open in new tab
      window.open(notification.action_url, '_blank', 'noopener,noreferrer');
    }
  };

  const getNotificationTypeColor = () => {
    switch (notification.type) {
      case 'session_booked':
      case 'session_reminder':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'hub_invite':
        return "bg-amber-100 text-amber-800 border-amber-200";
      case 'hub_membership':
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'session_booked':
      case 'session_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'hub_invite':
      case 'hub_membership':
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getNotificationTypeLabel = () => {
    switch (notification.type) {
      case 'session_booked':
        return "Session Booked";
      case 'session_reminder':
        return "Session Reminder";
      case 'hub_invite':
        return "Hub Invitation";
      case 'hub_membership':
        return "Hub Membership";
      default:
        return "Notification";
    }
  };

  const getActionButtonText = () => {
    if (!notification.action_url) return null;
    
    switch (notification.type) {
      case 'session_booked':
      case 'session_reminder':
        return isSessionLoading ? "Loading..." : "View Session";
      case 'hub_invite':
        return "View Invitation";
      case 'hub_membership':
        return "View Hub";
      default:
        return notification.action_url.startsWith('/') ? "View Details" : "Open Link";
    }
  };

  // Clean HTML content for display
  const getPlainTextMessage = (htmlContent: string) => {
    return htmlContent.replace(/<[^>]*>/g, '').trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Notification Details
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-sm px-3 py-1 flex items-center gap-1 ${getNotificationTypeColor()}`}
                >
                  {getNotificationIcon()}
                  {getNotificationTypeLabel()}
                </Badge>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleRead}
                    className="h-6 px-2 text-xs flex items-center gap-1"
                  >
                    {notification.read ? (
                      <>
                        <Circle className="h-3 w-3" />
                        Mark as Unread
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Mark as Read
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {notification.title}
              </h2>
              
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })} • {' '}
                {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {getPlainTextMessage(notification.message)}
              </p>
            </div>
          </div>

          {/* Debug Information for Session Notifications (only in development) */}
          {(notification.type === 'session_booked' || notification.type === 'session_reminder') && 
           process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <div>Session ID: {sessionId || 'Not found'}</div>
                <div>Loading: {isSessionLoading ? 'Yes' : 'No'}</div>
                <div>Session Date: {sessionDetails?.scheduled_at || 'Not available'}</div>
                <div>Error: {sessionError ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}

          {/* Actions Section */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {notification.action_url && getActionButtonText() && (
                <Button
                  onClick={handleActionUrl}
                  disabled={isSessionLoading}
                  className="flex items-center gap-2"
                >
                  {getActionButtonText()}
                  {!notification.action_url.startsWith('/') && 
                   notification.type !== 'session_booked' && 
                   notification.type !== 'session_reminder' && (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleRead}
                className={`flex items-center gap-2 ${
                  notification.read 
                    ? "text-gray-600 hover:text-gray-800" 
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                {notification.read ? (
                  <>
                    <Circle className="h-4 w-4" />
                    Mark Unread
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Mark Read
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
