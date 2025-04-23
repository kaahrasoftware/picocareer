
import React from "react";

interface ScheduleDateTimeInputProps {
  scheduledFor: string;
  setScheduledFor: (v: string) => void;
}

export function ScheduleDateTimeInput({ scheduledFor, setScheduledFor }: ScheduleDateTimeInputProps) {
  return (
    <div>
      <label htmlFor="scheduledFor" className="block font-medium mb-1">Start Date/Time</label>
      <input
        id="scheduledFor"
        type="datetime-local"
        value={scheduledFor}
        onChange={e => setScheduledFor(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />
    </div>
  );
}
