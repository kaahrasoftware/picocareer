
import React from "react";

interface FrequencySelectorProps {
  frequency: "daily" | "weekly" | "monthly";
  setFrequency: (v: "daily" | "weekly" | "monthly") => void;
}

export function FrequencySelector({ frequency, setFrequency }: FrequencySelectorProps) {
  return (
    <div>
      <label htmlFor="frequency" className="block font-medium mb-1">Frequency</label>
      <select
        id="frequency"
        value={frequency}
        onChange={e => setFrequency(e.target.value as any)}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
    </div>
  );
}
