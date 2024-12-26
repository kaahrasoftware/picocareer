import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotSelector } from "@/components/booking/TimeSlotSelector";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MentorAvailabilityFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function MentorAvailabilityForm({ onClose, onSuccess }: MentorAvailabilityFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // Get user ID on component mount
  useState(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: userId,
          date_available: format(selectedDate, 'yyyy-MM-dd'),
          start_time: selectedTime,
          end_time: format(
            new Date(selectedDate.setHours(parseInt(selectedTime.split(':')[0]) + 1)),
            'HH:mm'
          ),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error setting availability:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Set Your Availability</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border bg-kahra-darker"
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
        />
      </div>

      {selectedDate && (
        <TimeSlotSelector
          date={selectedDate}
          mentorId={userId}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          selectedSessionType={undefined}
        />
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedDate || !selectedTime || isSubmitting}
        >
          Save Availability
        </Button>
      </div>
    </div>
  );
}