import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, User, ExternalLink, Bell, CalendarClock, CalendarX, CheckCircle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent } from "@/types/calendar";
interface SessionCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  onJoin?: (event: CalendarEvent) => void;
  onReschedule?: (event: CalendarEvent) => void;
  onCancel?: (event: CalendarEvent) => void;
  onReminder?: (event: CalendarEvent) => void;
  onMarkComplete?: (event: CalendarEvent) => void;
  onFeedback?: (event: CalendarEvent) => void;
}
export function SessionCard({
  event,
  onClick,
  onJoin,
  onReschedule,
  onCancel,
  onReminder,
  onMarkComplete,
  onFeedback
}: SessionCardProps) {
  const startTime = new Date(event.start_time as string);
  const isUpcoming = startTime > new Date();
  const isPast = startTime < new Date();
  const isMentor = event.session_details?.mentor.id === event.user_id;
  const isCompleted = event.status === "completed";
  const isCancelled = event.status === "cancelled";
  const hasFeedback = event.session_details?.has_feedback === true;

  // Get participant details based on whether current user is mentor or mentee
  const participant = isMentor ? event.session_details?.mentee : event.session_details?.mentor;
  const handleButtonClick = (e: React.MouseEvent, handler?: (event: CalendarEvent) => void) => {
    if (!handler) return;
    e.stopPropagation();
    handler(event);
  };
  return <Card className={`relative overflow-hidden ${onClick && !isCancelled ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`} onClick={onClick && !isCancelled ? onClick : undefined}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <h3 className="text-base font-medium">{event.title}</h3>
            <p className="text-sm text-muted-foreground">
              {event.session_details?.session_type?.type || "Mentoring Session"}
            </p>
          </div>
          <Badge variant={isCancelled ? "destructive" : isCompleted ? "outline" : "secondary"} className={`whitespace-nowrap px-2 text-xs ${isCancelled ? "bg-destructive/10 hover:bg-destructive/20 text-destructive" : isCompleted ? "bg-green-100 hover:bg-green-200 text-green-800" : "bg-blue-100 hover:bg-blue-200 text-blue-800"}`}>
            {isCancelled ? "Cancelled" : isCompleted ? "Completed" : "Scheduled"}
          </Badge>
        </div>

        <div className="space-y-2 mt-2">
          <div className="flex items-center text-sm gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(startTime, "h:mm a")}</span>
            <span className="text-muted-foreground mx-1">•</span>
            <span>{event.session_details?.session_type?.duration || 60} min</span>
          </div>
          
          <div className="flex items-center text-sm gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(startTime, "MMMM d, yyyy")}</span>
          </div>
          
          {participant && <div className="flex items-center text-sm gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{participant.full_name}</span>
            </div>}
        </div>
      </CardContent>

      {/* Render action buttons based on session status and permissions */}
      {!isCancelled && <CardFooter className="flex flex-wrap gap-2 px-4 py-2 bg-muted/20">
          {/* Join button (visible for all users if meeting link exists) */}
          {event.session_details?.meeting_link && isUpcoming && <Button variant="default" size="sm" className="flex-grow" onClick={e => handleButtonClick(e, onJoin)}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Join
            </Button>}
          
          {/* Remind button (visible for mentors for upcoming sessions) */}
          {isUpcoming && onReminder && <Button variant="outline" size="sm" className="flex-grow" onClick={e => handleButtonClick(e, onReminder)}>
              <Bell className="h-4 w-4 mr-1" />
              Remind
            </Button>}
          
          {/* Reschedule button (visible for upcoming sessions) */}
          {isUpcoming && onReschedule}
          
          {/* Cancel button (visible for upcoming sessions) */}
          {isUpcoming && onCancel && <Button variant="outline" size="sm" className="flex-grow text-destructive hover:text-destructive" onClick={e => handleButtonClick(e, onCancel)}>
              <CalendarX className="h-4 w-4 mr-1" />
              Cancel
            </Button>}

          {/* Mark as Complete button (visible for mentors for non-completed sessions) */}
          {!isCompleted && !isUpcoming && onMarkComplete && isMentor && <Button variant="outline" size="sm" className="flex-grow text-green-600 hover:text-green-700" onClick={e => handleButtonClick(e, onMarkComplete)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>}
          
          {/* Feedback button (visible for past sessions) */}
          {isPast && onFeedback && <Button variant={hasFeedback ? "outline" : "outline"} size="sm" className={hasFeedback ? "flex-grow text-gray-400 opacity-75 cursor-not-allowed" : "flex-grow text-purple-600 hover:text-purple-700"} onClick={e => !hasFeedback && handleButtonClick(e, onFeedback)} disabled={hasFeedback}>
              <MessageSquare className="h-4 w-4 mr-1" />
              {hasFeedback ? "Feedback Provided" : "Feedback"}
            </Button>}
        </CardFooter>}
    </Card>;
}