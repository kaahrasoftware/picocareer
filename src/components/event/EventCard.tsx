
import { format } from "date-fns";
import { Calendar, Clock, Monitor, Users, Building, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventTypeTag } from "./EventTypeTag";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    platform: string;
    max_attendees?: number;
    organized_by?: string;
    timezone?: string;
    event_type?: string;
    facilitator?: string;
    thumbnail_url?: string;
    registrations_count?: number;
  };
  onRegister: (eventId: string) => void;
  onViewDetails: (eventId: string) => void;
  isRegistering?: boolean;
  isRegistered?: boolean;
}

export function EventCard({
  event,
  onRegister,
  onViewDetails,
  isRegistering = false,
  isRegistered = false,
}: EventCardProps) {
  const formatTime = (time: string) => {
    return format(new Date(time), "h:mm a");
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "MMMM d, yyyy");
  };

  // Get gradient overlay based on event type
  const getHeaderGradient = () => {
    const type = event.event_type?.toLowerCase() || '';
    
    if (type.includes('workshop')) {
      return "bg-gradient-to-br from-green-900/80 to-black/50";
    } else if (type.includes('webinar')) {
      return "bg-gradient-to-br from-purple-900/80 to-black/50";
    } else if (type.includes('conference')) {
      return "bg-gradient-to-br from-blue-900/80 to-black/50";
    } else if (type.includes('training')) {
      return "bg-gradient-to-br from-orange-900/80 to-black/50";
    } else if (type.includes('seminar')) {
      return "bg-gradient-to-br from-teal-900/80 to-black/50";
    } else if (type.includes('panel')) {
      return "bg-gradient-to-br from-pink-900/80 to-black/50";
    }
    
    // Default gradient
    return "bg-gradient-to-br from-gray-900/80 to-black/60";
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        {event.thumbnail_url && (
          <div className="absolute inset-0">
            <img 
              src={event.thumbnail_url} 
              alt={event.title}
              className="w-full h-[250px] object-cover"
            />
          </div>
        )}
        
        {/* Gradient overlay for better text readability */}
        <div className={cn(
          "absolute inset-0",
          event.thumbnail_url ? getHeaderGradient() : "bg-gradient-to-b from-primary/10 to-transparent"
        )}></div>
        
        <CardHeader className="relative z-10 h-[250px] flex flex-col justify-end pb-4">
          <div className="absolute top-4 right-4">
            {event.event_type && <EventTypeTag eventType={event.event_type} />}
          </div>
          
          <div className="mt-auto space-y-4">
            <CardTitle 
              className={cn(
                "text-2xl font-bold mb-2 leading-tight",
                event.thumbnail_url ? "text-white drop-shadow-md" : "text-foreground"
              )}
            >
              {event.title}
            </CardTitle>
            
            <div className={cn(
              "space-y-2",
              event.thumbnail_url ? "text-gray-100" : ""
            )}>
              {event.organized_by && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Building className="h-4 w-4 flex-shrink-0" />
                  <span className={event.thumbnail_url ? "text-white/90" : ""}>
                    {event.organized_by}
                  </span>
                </div>
              )}
              
              {event.facilitator && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className={cn(
                    "font-medium",
                    event.thumbnail_url ? "text-white/80" : "text-muted-foreground"
                  )}>
                    Facilitator: {event.facilitator}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </div>

      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{formatDate(event.start_time)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
                {event.timezone && (
                  <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded">
                    {event.timezone}
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{event.platform}</span>
            </div>
            {event.max_attendees && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {event.registrations_count || 0} / {event.max_attendees} registered
                </span>
              </div>
            )}
          </div>
        </div>

        <div 
          className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />

        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1"
            onClick={() => onRegister(event.id)}
            disabled={isRegistering || isRegistered}
          >
            {isRegistering ? "Registering..." : isRegistered ? "Registered" : "Register Now"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onViewDetails(event.id)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
