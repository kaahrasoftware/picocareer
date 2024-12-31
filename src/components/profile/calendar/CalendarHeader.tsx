import React from "react";
import { Badge } from "@/components/ui/badge";

interface CalendarHeaderProps {
  isMentor: boolean;
}

export function CalendarHeader({ isMentor }: CalendarHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Calendar</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Sessions
        </Badge>
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          Webinars
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