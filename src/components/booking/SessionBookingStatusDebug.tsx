
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface NotificationStatus {
  status: 'pending' | 'success' | 'failed';
  error?: string | null;
}

interface BookingStatus {
  mentorNotification: NotificationStatus;
  menteeNotification: NotificationStatus;
  adminNotification: NotificationStatus;
  mentorEmail: NotificationStatus;
  menteeEmail: NotificationStatus;
}

interface SessionBookingStatusDebugProps {
  isVisible: boolean;
  onClose: () => void;
}

export function SessionBookingStatusDebug({ isVisible, onClose }: SessionBookingStatusDebugProps) {
  const [status, setStatus] = useState<BookingStatus>({
    mentorNotification: { status: 'pending' },
    menteeNotification: { status: 'pending' },
    adminNotification: { status: 'pending' },
    mentorEmail: { status: 'pending' },
    menteeEmail: { status: 'pending' }
  });

  const getStatusIcon = (status: 'pending' | 'success' | 'failed') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'failed') => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          Booking & Notification Status (Debug Mode)
        </CardTitle>
        <CardDescription>
          Real-time status of session booking and notification delivery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">In-App Notifications</h4>
            
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.mentorNotification.status)}
                <span className="text-sm">Mentor Notification</span>
              </div>
              {getStatusBadge(status.mentorNotification.status)}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.menteeNotification.status)}
                <span className="text-sm">Mentee Notification</span>
              </div>
              {getStatusBadge(status.menteeNotification.status)}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.adminNotification.status)}
                <span className="text-sm">Admin Notification</span>
              </div>
              {getStatusBadge(status.adminNotification.status)}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Email Confirmations</h4>
            
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.mentorEmail.status)}
                <span className="text-sm">Mentor Email</span>
              </div>
              {getStatusBadge(status.mentorEmail.status)}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.menteeEmail.status)}
                <span className="text-sm">Mentee Email</span>
              </div>
              {getStatusBadge(status.menteeEmail.status)}
            </div>
          </div>
        </div>

        {/* Error details */}
        {Object.values(status).some(s => s.status === 'failed' && s.error) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <h5 className="font-medium text-red-800 mb-2">Error Details:</h5>
            <div className="space-y-1 text-sm text-red-700">
              {Object.entries(status).map(([key, value]) => (
                value.status === 'failed' && value.error && (
                  <div key={key}>
                    <strong>{key}:</strong> {value.error}
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4">
          Check the browser console for detailed logs of the booking process.
        </div>
      </CardContent>
    </Card>
  );
}
