import { supabase } from "@/integrations/supabase/client";
import { ExistingTimeSlots } from "./availability/ExistingTimeSlots";
import { TimeSlotForm } from "./availability/TimeSlotForm";
import { UnavailableTimeForm } from "./availability/UnavailableTimeForm";

interface AvailabilityManagerProps {
  profileId: string;
  onUpdate: () => void;
}

export function AvailabilityManager({ profileId, onUpdate }: AvailabilityManagerProps) {
  return (
    <div className="space-y-6">
      <TimeSlotForm profileId={profileId} onUpdate={onUpdate} />
      <UnavailableTimeForm profileId={profileId} onUpdate={onUpdate} />
      <ExistingTimeSlots profileId={profileId} onUpdate={onUpdate} />
    </div>
  );
}