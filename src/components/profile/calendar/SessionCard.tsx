
import React from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  User,
  Bell,
  CalendarX,
  CalendarClock
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CalendarEvent } from "@/types/calendar";

interface SessionCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  onReschedule?: (event: CalendarEvent) => void;
  onCancel?: (event: CalendarEvent) => void;
  onReminder?: (event: CalendarEvent) => void;
}

export function SessionCard({ 
  event, 
  onClick, 
  onReschedule, 
  onCancel, 
  onReminder 
}: SessionCardProps) {
  const startTime = new Date(event.start_time as string);
  const isUpcoming = startTime > new Date();
  const isMentor = event.session_details?.mentor.id === event.session_details?.mentee.id;

  // Get participant details based on whether current user is mentor or mentee
  const participant = isMentor 
    ? event.session_details?.mentee 
    : event.session_details?.mentor;

  return (
    <Card 
      className={`relative overflow-hidden ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <h3 className="text-base font-medium">{event.title}</h3>
            <p className="text-sm text-muted-foreground">
              {event.session_details?.session_type?.type || "Mentoring Session"}
            </p>
          </div>
          <div className={`px-2 py-1 text-xs rounded-full ${
            event.status === "cancelled" ? "bg-destructive/10 text-destructive" : 
            event.status === "completed" ? "bg-green-100 text-green-800" : 
            "bg-blue-100 text-blue-800"
          }`}>
            {event.status === "cancelled" ? "Cancelled" : 
             event.status === "completed" ? "Completed" : 
             "Scheduled"}
          </div>
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
          
          {participant && (
            <div className="flex items-center text-sm gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{participant.full_name}</span>
            </div>
          )}
        </div>
      </CardContent>

      {isUpcoming && (
        <CardFooter className="flex justify-end gap-2 px-4 py-2 bg-muted/20">
          {onReminder && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onReminder(event);
              }}
            >
              <Bell className="h-4 w-4 mr-1" />
              Remind
            </Button>
          )}
          
          {onReschedule && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onReschedule(event);
              }}
            >
              <CalendarClock className="h-4 w-4 mr-1" />
              Reschedule
            </Button>
          )}
          
          {onCancel && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(event);
              }}
            >
              <CalendarX className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
