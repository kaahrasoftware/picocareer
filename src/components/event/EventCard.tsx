import { format } from "date-fns";
import { Calendar, Clock, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  platform: 'Google Meet' | 'Zoom';
  meeting_link?: string;
  max_attendees?: number;
  thumbnail_url?: string;
}

interface EventCardProps {
  event: Event;
  isRegistering: boolean;
  isRegistered: boolean;
  isPast: boolean;
  onRegister: (eventId: string) => void;
  onViewDetails: (eventId: string) => void;
}

export function EventCard({ 
  event, 
  isRegistering, 
  isRegistered, 
  isPast,
  onRegister,
  onViewDetails
}: EventCardProps) {
  // Query to get the registration count
  const { data: registrationCount = 0 } = useQuery({
    queryKey: ['event-registration-count', event.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('webinar_id', event.id);
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Function to truncate description
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <Card key={event.id} className="flex flex-col">
      {event.thumbnail_url && (
        <div className="p-4 pb-0">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
            <img 
              src={event.thumbnail_url} 
              alt={event.title}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
        </div>
      )}
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {format(new Date(event.start_time), 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">
          {truncateDescription(event.description)}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
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
                {registrationCount} / {event.max_attendees} registered
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          className="flex-1"
          onClick={() => onRegister(event.id)}
          disabled={isRegistering || isRegistered || isPast || (event.max_attendees && registrationCount >= event.max_attendees)}
          variant="default"
        >
          {isPast 
            ? "Event Ended"
            : isRegistering 
              ? "Registering..." 
              : isRegistered
                ? "Registered"
                : event.max_attendees && registrationCount >= event.max_attendees
                  ? "Registration Full"
                  : "Register Now"}
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