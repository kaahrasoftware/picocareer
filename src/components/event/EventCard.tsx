import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Event } from "@/pages/Event";

interface EventCardProps {
  event: Event;
  isRegistering: boolean;
  isRegistered: boolean;
  onRegister: (eventId: string) => void;
  onViewDetails: (eventId: string) => void;
}

export function EventCard({
  event,
  isRegistering,
  isRegistered,
  onRegister,
  onViewDetails,
}: EventCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(event.start_time), 'PPP')}
          </p>
        </div>
        <Button onClick={() => onViewDetails(event.id)}>View Details</Button>
      </div>

      <div 
        className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: event.description }}
      />

      <div className="flex gap-3 pt-2">
        <Button 
          onClick={() => onRegister(event.id)} 
          disabled={isRegistering || isRegistered}
        >
          {isRegistering ? "Registering..." : isRegistered ? "Registered" : "Register"}
        </Button>
      </div>
    </div>
  );
}