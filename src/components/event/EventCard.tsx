import { format } from "date-fns";
import { Tag, Calendar, Clock, Monitor, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        {event.thumbnail_url && (
          <div className="absolute inset-0 bg-black/70">
            <img 
              src={event.thumbnail_url} 
              alt={event.title}
              className="w-full h-[250px] object-cover opacity-60"
            />
          </div>
        )}
        <CardHeader className="relative z-10 h-[250px] flex flex-col justify-end pb-4">
          {event.event_type && (
            <div className="absolute top-4 right-4">
              <Badge variant="destructive" className="text-xs font-medium">
                <Tag className="h-3 w-3 mr-1" />
                {event.event_type}
              </Badge>
            </div>
          )}
          <div className="mt-auto">
            <CardTitle className={`text-xl mb-4 ${event.thumbnail_url ? 'text-white' : ''}`}>
              {event.title}
            </CardTitle>
            <div className={`grid grid-cols-2 gap-4 ${event.thumbnail_url ? 'text-gray-200' : ''}`}>
              <div>
                <p className="text-sm">By: {event.organized_by || 'PicoCareer & I-Impact'}</p>
              </div>
              {event.facilitator && (
                <div>
                  <p className="text-sm">Facilitator: {event.facilitator}</p>
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
              <Calendar className="h-4 w-4" />
              <span className="text-muted-foreground">{formatDate(event.start_time)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className="text-muted-foreground">
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Monitor className="h-4 w-4" />
              <span className="text-muted-foreground">{event.platform}</span>
            </div>
            {event.max_attendees && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span className="text-muted-foreground">
                  {event.registrations_count || 0} / {event.max_attendees} registered
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>

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