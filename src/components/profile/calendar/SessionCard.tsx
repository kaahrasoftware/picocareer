
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Video } from "lucide-react";
import { format, isAfter } from "date-fns";
import { capitalizeFirstLetter } from "@/lib/stringUtils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCancelMentorSession } from "@/hooks/useCancelMentorSession"; 

interface CalendarEvent {
  id: string;
  title: string;
  mentee_id: string;
  mentee_name?: string;
  mentee_email?: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  meeting_link?: string | null;
  session_type: string;
  status: string;
  description?: string | null;
  meeting_platform: string;
}

interface SessionCardProps {
  session: CalendarEvent;
  onCancel?: (event: CalendarEvent) => void;
}

export function SessionCard({ session, onCancel }: SessionCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { cancelSession, isLoading } = useCancelMentorSession();

  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);
  const canCancel = isAfter(startTime, new Date());

  const handleCancelSession = async () => {
    try {
      await cancelSession(session.id);
      toast.success("Session cancelled successfully");
      setShowCancelDialog(false);
      if (onCancel) {
        onCancel(session);
      }
    } catch (error) {
      console.error("Failed to cancel session:", error);
      toast.error("Failed to cancel session");
    }
  };

  const getMeetingPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "google meet":
        return <Video className="h-4 w-4" />;
      case "zoom":
        return <Video className="h-4 w-4" />;
      case "teams":
        return <Video className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">{session.title || capitalizeFirstLetter(session.session_type)}</CardTitle>
          <Badge variant={session.status === 'confirmed' ? "default" : (session.status === 'cancelled' ? "destructive" : "outline")}>
            {capitalizeFirstLetter(session.status)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(startTime, "MMMM d, yyyy")}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}</span>
            </div>
            
            {session.meeting_platform && (
              <div className="flex items-center gap-2 text-sm">
                {getMeetingPlatformIcon(session.meeting_platform)}
                <span>{session.meeting_platform}</span>
              </div>
            )}
            
            {session.mentee_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{session.mentee_name}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(true)}>
                View Details
              </Button>
              
              {canCancel && session.status !== 'cancelled' && (
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => setShowCancelDialog(true)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Session Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{session.title || capitalizeFirstLetter(session.session_type)} Session</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Date & Time</h4>
                <p className="text-sm text-muted-foreground">
                  {format(startTime, "MMMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Session Type</h4>
                <p className="text-sm text-muted-foreground">
                  {capitalizeFirstLetter(session.session_type)}
                </p>
              </div>
              
              {session.mentee_name && (
                <div>
                  <h4 className="text-sm font-medium">Mentee</h4>
                  <p className="text-sm text-muted-foreground">
                    {session.mentee_name}
                  </p>
                  {session.mentee_email && (
                    <p className="text-sm text-muted-foreground">
                      {session.mentee_email}
                    </p>
                  )}
                </div>
              )}
              
              {session.meeting_platform && (
                <div>
                  <h4 className="text-sm font-medium">Meeting Platform</h4>
                  <p className="text-sm text-muted-foreground">
                    {session.meeting_platform}
                  </p>
                </div>
              )}
            </div>
            
            {session.description && (
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {session.description}
                </p>
              </div>
            )}
            
            {session.meeting_link && (
              <div>
                <h4 className="text-sm font-medium">Meeting Link</h4>
                <a 
                  href={session.meeting_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Open Meeting Link
                </a>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Session Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
          </DialogHeader>
          
          <p>Are you sure you want to cancel this session? This action cannot be undone.</p>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Back
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSession}
              disabled={isLoading}
            >
              {isLoading ? "Cancelling..." : "Cancel Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
