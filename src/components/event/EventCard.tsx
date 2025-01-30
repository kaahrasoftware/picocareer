import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  platform: string;
  event_type: string;
  thumbnail_url?: string;
  registrations_count?: number;
  max_attendees?: number;
  onClick?: () => void;
}

export function EventCard({
  id,
  title,
  description,
  start_time,
  end_time,
  platform,
  event_type,
  thumbnail_url,
  registrations_count = 0,
  max_attendees,
  onClick,
}: EventCardProps) {
  // Parse the ISO strings into Date objects
  const startDate = start_time ? parseISO(start_time) : new Date();
  const endDate = end_time ? parseISO(end_time) : new Date();

  return (
    <Card 
      className="group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      {thumbnail_url && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={thumbnail_url}
            alt={title}
            className="h-full w-full object-cover transition-all group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className="bg-sky-100 text-sky-700 hover:bg-sky-100"
          >
            {event_type}
          </Badge>
          <Badge 
            variant="outline" 
            className="bg-transparent"
          >
            {platform}
          </Badge>
        </div>
        <h3 className="font-semibold text-xl leading-none tracking-tight">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div 
          className="text-sm text-muted-foreground line-clamp-2"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {format(startDate, "MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
            </span>
          </div>
          {max_attendees && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {registrations_count} / {max_attendees} registered
              </span>
            </div>
          )}
        </div>
        <Button 
          variant="secondary" 
          className={cn(
            "w-full",
            max_attendees && registrations_count >= max_attendees && "opacity-50 cursor-not-allowed"
          )}
          disabled={max_attendees ? registrations_count >= max_attendees : false}
        >
          {max_attendees && registrations_count >= max_attendees 
            ? "Event Full" 
            : "Register Now"
          }
        </Button>
      </CardContent>
    </Card>
  );
}