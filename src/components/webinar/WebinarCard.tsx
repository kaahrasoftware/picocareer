import { format } from "date-fns";
import { Calendar, Clock, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface WebinarCardProps {
  webinar: {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    platform: 'Google Meet' | 'Zoom';
    meeting_link?: string;
    max_attendees?: number;
    thumbnail_url?: string;
  };
  isRegistering: boolean;
  isRegistered: boolean;
  isPast: boolean;
  onRegister: (webinarId: string) => void;
}

export function WebinarCard({ 
  webinar, 
  isRegistering, 
  isRegistered, 
  isPast,
  onRegister 
}: WebinarCardProps) {
  return (
    <Card key={webinar.id} className="flex flex-col">
      {webinar.thumbnail_url && (
        <div className="p-4 pb-0">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
            <img 
              src={webinar.thumbnail_url} 
              alt={webinar.title}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
        </div>
      )}
      <CardHeader>
        <CardTitle>{webinar.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {format(new Date(webinar.start_time), 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{webinar.description}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            {format(new Date(webinar.start_time), 'p')} - {format(new Date(webinar.end_time), 'p')}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4" />
            {webinar.platform}
          </div>
          {webinar.max_attendees && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Limited to {webinar.max_attendees} attendees
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={() => onRegister(webinar.id)}
          disabled={isRegistering || isRegistered || isPast}
        >
          {isPast 
            ? "Webinar Ended"
            : isRegistering 
              ? "Registering..." 
              : isRegistered
                ? "Registered"
                : "Register Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}