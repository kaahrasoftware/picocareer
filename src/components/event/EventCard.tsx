import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Video } from "lucide-react";
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
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>
          {event.organized_by && `Organized by ${event.organized_by}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.start_time), 'PPP')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {format(new Date(event.start_time), 'p')} - {format(new Date(event.end_time), 'p')}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4" />
              {event.platform}
            </div>
            {event.max_attendees && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                {registrations?.length || 0} / {event.max_attendees} registered
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
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