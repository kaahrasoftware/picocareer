
import React from "react";

type AllowedFrequency = "daily" | "weekly" | "monthly";

interface FrequencySelectorProps {
  frequency: AllowedFrequency;
  setFrequency: (v: AllowedFrequency) => void;
}

export function FrequencySelector({ frequency, setFrequency }: FrequencySelectorProps) {
  return (
    <div>
      <label htmlFor="frequency" className="block font-medium mb-1">Frequency</label>
      <select
        id="frequency"
        value={frequency}
        onChange={e => setFrequency(e.target.value as AllowedFrequency)}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <p className="text-sm text-muted-foreground mt-1">
        For one-time campaigns, select "Daily" and they will be sent only once.
      </p>
    </div>
  );
}
