
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { ExternalLink } from "lucide-react";

interface SessionDetailViewProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onJoin?: (event: CalendarEvent) => void;
  onReschedule?: (event: CalendarEvent) => void;
  onCancel?: (event: CalendarEvent) => void;
  onComplete?: (event: CalendarEvent) => void;
  isMentor: boolean;
}

export function SessionDetailView({
  event,
  isOpen,
  onClose,
  onJoin,
  onReschedule,
  onCancel,
  onComplete,
  isMentor
}: SessionDetailViewProps) {
  if (!isOpen || !event) return null;

  const startTime = event.start_time ? new Date(event.start_time) : new Date();
  const endTime = event.end_time ? new Date(event.end_time) : new Date(startTime.getTime() + 60 * 60 * 1000);
  const isUpcoming = startTime > new Date();
  const isOngoing = startTime <= new Date() && endTime >= new Date();
  const isPast = endTime < new Date();
  const isCancelled = event.status === "cancelled" || event.status === "no_show";

  // Check if the session is with a mentee (for mentors) or with a mentor (for mentees)
  const participantType = isMentor ? "Mentee" : "Mentor";
  const participantName = event.title.split(" with ")[1] || "Unknown";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{format(startTime, "MMMM d, yyyy")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Start Time</p>
              <p className="font-medium">{format(startTime, "h:mm a")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">End Time</p>
              <p className="font-medium">{format(endTime, "h:mm a")}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{participantType}</p>
            <p className="font-medium">{participantName}</p>
          </div>

          {event.session_details?.session_type && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Session Type</p>
              <p className="font-medium">{event.session_details.session_type.type}</p>
            </div>
          )}

          {event.session_details?.meeting_link && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Meeting Link</p>
              <div className="flex items-center">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary" 
                  onClick={() => onJoin && onJoin(event)}
                >
                  Join Meeting <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {event.session_details?.notes && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm">{event.session_details.notes}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            {isUpcoming && !isCancelled && onCancel && (
              <Button variant="outline" size="sm" onClick={() => onCancel(event)}>
                Cancel
              </Button>
            )}
            
            {isUpcoming && !isCancelled && onReschedule && (
              <Button variant="outline" size="sm" onClick={() => onReschedule(event)}>
                Reschedule
              </Button>
            )}
            
            {isOngoing && !isCancelled && onJoin && (
              <Button size="sm" onClick={() => onJoin(event)}>
                Join Session
              </Button>
            )}
            
            {isMentor && isPast && event.status === "scheduled" && onComplete && (
              <Button size="sm" onClick={() => onComplete(event)}>
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
