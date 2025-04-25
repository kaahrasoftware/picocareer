
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ScheduleDateTimeInputProps {
  scheduledFor: string;
  setScheduledFor: (v: string) => void;
}

export function ScheduleDateTimeInput({ scheduledFor, setScheduledFor }: ScheduleDateTimeInputProps) {
  return (
    <div>
      <Label htmlFor="scheduledFor" className="block text-sm font-medium">Start Date/Time</Label>
      <Input
        id="scheduledFor"
        type="datetime-local"
        value={scheduledFor}
        onChange={e => setScheduledFor(e.target.value)}
        className="mt-1 w-full"
      />
      <p className="text-sm text-muted-foreground mt-1">
        Select when this campaign should start sending.
      </p>
    </div>
  );
}
