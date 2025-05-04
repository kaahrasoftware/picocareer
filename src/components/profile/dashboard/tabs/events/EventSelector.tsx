
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

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
          className={`cursor-pointer hover:border-primary transition-colors ${selectedEvent === 'all' ? 'border-2 border-primary bg-primary/5' : ''}`}
          onClick={() => handleSelectEvent('all')}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">All Events</h4>
                <p className="text-sm text-muted-foreground">
                  {Object.values(registrationCounts).reduce((sum, count) => sum + count, 0)} Registrations
                </p>
              </div>
              <Badge variant="secondary">
                {Object.keys(registrationCounts).length} Events
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Individual Events */}
        {events.map((event) => (
          <Card 
            key={event.id}
            className={`cursor-pointer hover:border-primary transition-colors ${selectedEvent === event.id ? 'border-2 border-primary bg-primary/5' : ''}`}
            onClick={() => handleSelectEvent(event.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium line-clamp-1 mb-1">{event.title}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className="line-clamp-1">
                      {new Date(event.start_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge>
                  {registrationCounts[event.id] || 0} Registrations
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
