import { useState } from "react";
import { TimeSlotForm } from "./availability/TimeSlotForm";
import { UnavailableTimeForm } from "./availability/UnavailableTimeForm";
import { ExistingTimeSlots } from "./availability/ExistingTimeSlots";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

interface AvailabilitySectionProps {
  selectedDate: Date;
  onAvailabilityChange: () => void;
}

export function AvailabilitySection({ selectedDate, onAvailabilityChange }: AvailabilitySectionProps) {
  const { session } = useAuthSession();
  const [showUnavailableForm, setShowUnavailableForm] = useState(false);

  const { data: availabilitySlots = [] } = useQuery({
    queryKey: ['mentor-availability', selectedDate, session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', session?.user.id)
        .gte('start_date_time', new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString())
        .lte('start_date_time', new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString())
        .order('start_date_time', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id && !!selectedDate,
  });

  const handleDeleteTimeSlot = async (id: string) => {
    const { error } = await supabase
      .from('mentor_availability')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting time slot:', error);
      return;
    }

    onAvailabilityChange();
  };

  return (
    <div className="mt-4 space-y-6">
      <div className="space-y-4">
        {showUnavailableForm ? (
          <UnavailableTimeForm
            selectedDate={selectedDate}
            profileId={session?.user.id || ''}
            onSuccess={() => {
              setShowUnavailableForm(false);
              onAvailabilityChange();
            }}
          />
        ) : (
          <TimeSlotForm
            selectedDate={selectedDate}
            profileId={session?.user.id || ''}
            onSuccess={onAvailabilityChange}
            onShowUnavailable={() => setShowUnavailableForm(true)}
          />
        )}
      </div>

      <ExistingTimeSlots
        slots={availabilitySlots}
        onDelete={handleDeleteTimeSlot}
      />
    </div>
  );
}