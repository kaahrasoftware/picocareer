
import React from 'react';
import { format, parseISO, isAfter } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <ScrollArea className="h-[350px] pr-4">
      <div className="grid gap-3 pb-2">
        {sortedSlots.map((slot) => {
          const startTime = parseISO(slot.start_date_time);
          const endTime = parseISO(slot.end_date_time);
          const creationDate = new Date(slot.created_at);
          const slotDate = new Date(slot.start_date_time);
          slotDate.setHours(0, 0, 0, 0);
          
          // Determine if this recurring slot affects past dates
          const isPastRecurring = slot.recurring && !isAfter(slotDate, creationDate) && isAfter(today, slotDate);
          
          return (
            <div 
              key={slot.id} 
              className={`flex items-center justify-between p-4 rounded-lg border 
                ${slot.is_available 
                  ? 'bg-background hover:bg-accent/5' 
                  : 'bg-destructive/10 border-destructive/20'}
                ${slot.recurring ? 'border-l-4 border-l-primary' : ''}
                ${isPastRecurring ? 'border-l-4 border-l-amber-500' : ''}
                transition-colors`}
            >
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className={`p-1.5 rounded-md mr-3
                    ${slot.is_available 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-destructive/10 text-destructive'}`}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="font-medium">
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </span>
                  
                  {slot.recurring && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className={`ml-2 
                            ${isPastRecurring 
                              ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' 
                              : 'bg-primary/10 text-primary border-primary/20'}`}>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Weekly
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {isPastRecurring 
                              ? 'This recurring slot was created after this date' 
                              : 'This slot repeats every week'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {!slot.is_available && (
                    <Badge variant="outline" className="ml-2 bg-destructive/10 text-destructive border-destructive/20">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unavailable
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground pl-9">
                  <Calendar className="h-4 w-4 mr-2 opacity-70" />
                  {slot.recurring ? (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="cursor-help underline decoration-dotted">
                          Every {format(startTime, 'EEEE')}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 text-sm">
                        <div className="space-y-1">
                          <p>
                            <span className="font-semibold">Starting from:</span> {format(creationDate, 'MMMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recurring availability only applies to dates after it was created.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    <span>{format(startTime, 'MMMM d, yyyy')}</span>
                  )}
                </div>
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
