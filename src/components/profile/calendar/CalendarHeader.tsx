import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CalendarHeaderProps {
  isMentor: boolean;
  onSetAvailability: () => void;
}

export function CalendarHeader({ isMentor, onSetAvailability }: CalendarHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Calendar</h2>
        {isMentor && (
          <Button 
            onClick={onSetAvailability}
            className="flex items-center gap-2"
          >
            <CalendarPlus className="w-4 h-4" />
            Set Availability
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Sessions
        </Badge>
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          Webinars
        </Badge>
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Holidays
        </Badge>
        {isMentor && (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            Available
          </Badge>
        )}
      </div>
    </>
  );
}