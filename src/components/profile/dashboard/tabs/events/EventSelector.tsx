
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventSelectorProps {
  events: any[];
  selectedEvent: string;
  onEventChange: (eventId: string) => void;
  registrationCounts: Record<string, number>;
  isLoading: boolean;
}

export function EventSelector({ 
  events, 
  selectedEvent, 
  onEventChange, 
  registrationCounts, 
  isLoading 
}: EventSelectorProps) {
  
  const handleSelectEvent = (eventId: string) => {
    onEventChange(eventId);
  };

  // Function to get gradient based on event type
  const getEventGradient = (eventType?: string) => {
    if (!eventType) return "from-blue-50 to-indigo-50";
    
    const type = eventType.toLowerCase();
    if (type.includes('workshop')) {
      return "from-green-50 to-emerald-50";
    } else if (type.includes('webinar')) {
      return "from-purple-50 to-violet-50";
    } else if (type.includes('conference')) {
      return "from-blue-50 to-sky-50";
    } else if (type.includes('training')) {
      return "from-orange-50 to-amber-50";
    } else if (type.includes('seminar')) {
      return "from-teal-50 to-cyan-50";
    } else if (type.includes('panel')) {
      return "from-pink-50 to-rose-50";
    }
    return "from-blue-50 to-indigo-50";
  };

  // Function to get card border color based on selection status
  const getCardBorderClass = (eventId: string) => {
    return selectedEvent === eventId 
      ? "border-2 border-primary ring-2 ring-primary/20" 
      : "border border-muted hover:border-primary/50";
  };

  // If no events are loaded yet, show a loading state
  if (isLoading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Select an Event</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-muted/30 animate-pulse h-24">
              <CardContent className="p-4"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If there are no events, show a message
  if (events.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-2">No Events Available</h3>
          <p className="text-muted-foreground">There are no events to display registrations for.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Select an Event</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* All Events Option */}
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden",
            getCardBorderClass('all'),
            selectedEvent === 'all' ? "bg-gradient-to-br from-blue-100 to-indigo-50" : "bg-gradient-to-br from-gray-50 to-white"
          )}
          onClick={() => handleSelectEvent('all')}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">All Events</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {Object.values(registrationCounts).reduce((sum, count) => sum + count, 0)} Registrations
                </p>
                <div className="mt-2 w-full bg-muted/40 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-full"></div>
                </div>
              </div>
              <Badge variant={selectedEvent === 'all' ? "default" : "secondary"} className="transition-colors">
                {Object.keys(registrationCounts).length} Events
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Individual Events */}
        {events.map((event) => {
          const totalReg = Math.max(event.max_attendees || 100, 1);
          const currentReg = registrationCounts[event.id] || 0;
          const percentFilled = (currentReg / totalReg) * 100;
          const eventDate = new Date(event.start_time);
          
          return (
            <Card 
              key={event.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-md group overflow-hidden",
                getCardBorderClass(event.id),
                selectedEvent === event.id 
                  ? `bg-gradient-to-br ${getEventGradient(event.event_type)}` 
                  : "bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white"
              )}
              onClick={() => handleSelectEvent(event.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="line-clamp-1">
                        {eventDate.toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <div className="text-xs flex justify-between mb-1">
                        <span>{currentReg} Registrations</span>
                        {event.max_attendees && (
                          <span className="text-muted-foreground">
                            {Math.round(percentFilled)}%
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            percentFilled > 75 ? "bg-orange-500" : 
                            percentFilled > 50 ? "bg-amber-500" : 
                            "bg-primary"
                          )}
                          style={{ width: `${Math.min(percentFilled, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  {event.event_type && (
                    <Badge 
                      variant={selectedEvent === event.id ? "default" : "outline"}
                      className="transition-colors text-xs whitespace-nowrap"
                    >
                      {event.event_type}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
