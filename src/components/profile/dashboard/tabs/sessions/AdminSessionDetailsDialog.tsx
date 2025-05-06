
import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertTriangle, CalendarClock } from "lucide-react";
import { SessionFeedbackDisplay } from "./SessionFeedbackDisplay";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import type { MentorSession } from "@/types/database/session";

interface AdminSessionDetailsDialogProps {
  session: MentorSession;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSessionDetailsDialog({ 
  session, 
  isOpen, 
  onClose 
}: AdminSessionDetailsDialogProps) {
  const { isLoading } = useSessionManagement();
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "completed":
        return <Badge variant="success" className="flex gap-1 items-center">
          <CheckCircle className="h-3 w-3" /> Completed
        </Badge>;
      case "scheduled":
        return <Badge variant="outline" className="flex gap-1 items-center">
          Scheduled
        </Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="flex gap-1 items-center">
          <XCircle className="h-3 w-3" /> Cancelled
        </Badge>;
      case "no-show":
        return <Badge variant="warning" className="flex gap-1 items-center">
          <AlertTriangle className="h-3 w-3" /> No-show
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };
  
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Session Details</span>
            {getStatusBadge(session.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* Session Overview */}
          <Card className="border-0 shadow-sm bg-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex gap-2 items-center">
                <CalendarClock className="h-4 w-4 text-primary" />
                <span>
                  {formatDate(session.scheduled_at)} at {formatTime(session.scheduled_at)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm font-medium">
                Type: <span className="font-normal">{session.session_type.type}</span>
              </p>
              <p className="text-sm font-medium">
                Duration: <span className="font-normal">{session.session_type.duration} minutes</span>
              </p>
              {session.meeting_platform && (
                <p className="text-sm font-medium">
                  Platform: <span className="font-normal">{session.meeting_platform}</span>
                </p>
              )}
              {session.meeting_link && (
                <p className="text-sm font-medium">
                  Meeting Link: <a href={session.meeting_link} className="text-primary truncate hover:underline" target="_blank" rel="noreferrer">{session.meeting_link}</a>
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Participants */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Mentor</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={session.mentor.avatar_url || ""} />
                  <AvatarFallback>{session.mentor.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{session.mentor.full_name}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Mentee</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={session.mentee.avatar_url || ""} />
                  <AvatarFallback>{session.mentee.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{session.mentee.full_name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Notes */}
          {session.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Session Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{session.notes}</p>
              </CardContent>
            </Card>
          )}
          
          <Separator />
          
          {/* Feedback */}
          <div>
            <h3 className="text-base font-medium mb-3">Session Feedback</h3>
            <SessionFeedbackDisplay sessionId={session.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
