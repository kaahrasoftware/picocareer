import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Video, Tag, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

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
  const { data: registrations } = useQuery({
    queryKey: ['event-registrations', event.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', event.id);

      if (error) throw error;
      return data;
    },
  });

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="relative">
        <div className="absolute top-4 right-4">
          {event.event_type && (
            <Badge variant="destructive" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {event.event_type}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{event.title}</CardTitle>
        <CardDescription className="text-xs">
          {event.organized_by && `By: ${event.organized_by}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              {format(new Date(event.start_time), 'PPP')}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3" />
              {format(new Date(event.start_time), 'p')} - {format(new Date(event.end_time), 'p')} {event.timezone && `(${event.timezone})`}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Video className="h-3 w-3" />
              {event.platform}
            </div>
            {event.max_attendees && (
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-3 w-3" />
                {registrations?.length || 0} / {event.max_attendees} registered
              </div>
            )}
            {event.facilitator && (
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3 w-3" />
                {event.facilitator}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {truncateDescription(event.description)}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
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
      </CardFooter>
    </Card>
  );
}