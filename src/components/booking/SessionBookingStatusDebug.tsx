
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface NotificationStatus {
  admins: 'pending' | 'success' | 'failed';
  meetLink: 'pending' | 'success' | 'failed' | 'na';
  notifications: 'pending' | 'success' | 'failed';
  email: 'pending' | 'success' | 'failed';
}

interface SessionBookingStatusProps {
  isVisible: boolean;
  sessionId?: string;
  meetingPlatform?: string;
}

export function SessionBookingStatusDebug({ 
  isVisible, 
  sessionId, 
  meetingPlatform 
}: SessionBookingStatusProps) {
  const [status, setStatus] = useState<NotificationStatus>({
    admins: 'pending',
    meetLink: meetingPlatform === 'Google Meet' ? 'pending' : 'na',
    notifications: 'pending',
    email: 'pending'
  });

  useEffect(() => {
    if (!isVisible || !sessionId) return;

    // Simulate status updates - in real implementation, this would listen to actual events
    const timer1 = setTimeout(() => {
      setStatus(prev => ({ ...prev, admins: 'success' }));
    }, 1000);

    const timer2 = setTimeout(() => {
      setStatus(prev => ({ 
        ...prev, 
        meetLink: meetingPlatform === 'Google Meet' ? 'success' : 'na' 
      }));
    }, 2000);

    const timer3 = setTimeout(() => {
      setStatus(prev => ({ ...prev, notifications: 'success' }));
    }, 3000);

    const timer4 = setTimeout(() => {
      setStatus(prev => ({ ...prev, email: 'success' }));
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isVisible, sessionId, meetingPlatform]);

  if (!isVisible) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'na':
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-700">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Processing...</Badge>;
      case 'na':
        return <Badge variant="outline">N/A</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Session Booking Status
        </CardTitle>
        <CardDescription>
          Tracking notification and confirmation delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.admins)}
              <span className="text-sm font-medium">Admin Notifications</span>
            </div>
            {getStatusBadge(status.admins)}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.meetLink)}
              <span className="text-sm font-medium">Meeting Link Creation</span>
            </div>
            {getStatusBadge(status.meetLink)}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.notifications)}
              <span className="text-sm font-medium">In-App Notifications</span>
            </div>
            {getStatusBadge(status.notifications)}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.email)}
              <span className="text-sm font-medium">Email Confirmations</span>
            </div>
            {getStatusBadge(status.email)}
          </div>
        </div>
        
        {sessionId && (
          <div className="mt-4 p-2 bg-white rounded border text-xs text-gray-600">
            <strong>Session ID:</strong> {sessionId}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
