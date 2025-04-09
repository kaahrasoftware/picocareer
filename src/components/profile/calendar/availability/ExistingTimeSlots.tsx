
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Calendar, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExistingTimeSlotsProps {
  slots: any[];
  onDelete: (id: string) => void;
}

export function ExistingTimeSlots({ slots, onDelete }: ExistingTimeSlotsProps) {
  if (!slots.length) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg bg-background/50">
        <p className="text-muted-foreground">No availability slots set for this date.</p>
        <p className="text-sm text-muted-foreground mt-2">Select a date and add available times to see them here.</p>
      </div>
    );
  }

  // Sort the slots by start time
  const sortedSlots = [...slots].sort((a, b) => {
    return new Date(a.start_date_time).getTime() - new Date(b.start_date_time).getTime();
  });

  return (
    <ScrollArea className="h-[350px] pr-4">
      <div className="grid gap-3 pb-2">
        {sortedSlots.map((slot) => {
          const startTime = parseISO(slot.start_date_time);
          const endTime = parseISO(slot.end_date_time);
          const creationDate = parseISO(slot.created_at);
          
          return (
            <div 
              key={slot.id} 
              className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent/5 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center flex-wrap">
                  <div className="bg-primary/10 text-primary p-1.5 rounded-md mr-3">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="font-medium">
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </span>
                  
                  {slot.recurring && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Weekly
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Recurring weekly on {format(startTime, 'EEEE')}s starting from {format(creationDate, 'MMM d, yyyy')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground pl-9">
                  <Calendar className="h-4 w-4 mr-2 opacity-70" />
                  {slot.recurring ? (
                    <span>Every {format(startTime, 'EEEE')} starting {format(creationDate, 'MMM d, yyyy')}</span>
                  ) : (
                    <span>{format(startTime, 'MMMM d, yyyy')}</span>
                  )}
                </div>
                
                {!slot.is_available && (
                  <div className="pl-9 text-sm text-destructive">
                    <span>Marked as unavailable</span>
                  </div>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9 p-0"
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
