
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Calendar, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ExistingTimeSlotsProps {
  slots: any[];
  onDelete: (id: string) => void;
}

export function ExistingTimeSlots({ slots, onDelete }: ExistingTimeSlotsProps) {
  if (!slots.length) {
    return (
      <div className="text-center py-6 border border-dashed rounded-md bg-background">
        <p className="text-muted-foreground">No availability slots set for this date.</p>
      </div>
    );
  }

  // Sort the slots by start time
  const sortedSlots = [...slots].sort((a, b) => {
    return new Date(a.start_date_time).getTime() - new Date(b.start_date_time).getTime();
  });

  return (
    <ScrollArea className="h-[320px] pr-4">
      <div className="space-y-3">
        {sortedSlots.map((slot) => {
          const startTime = parseISO(slot.start_date_time);
          const endTime = parseISO(slot.end_date_time);
          
          return (
            <div 
              key={slot.id} 
              className="flex items-center justify-between p-4 rounded-md border bg-background hover:bg-accent/5 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </span>
                  
                  {slot.recurring && (
                    <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Weekly
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {slot.recurring ? (
                    <span>Every {format(startTime, 'EEEE')}</span>
                  ) : (
                    <span>{format(startTime, 'MMMM d, yyyy')}</span>
                  )}
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(slot.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
