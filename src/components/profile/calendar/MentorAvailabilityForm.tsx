import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TimeSlotForm } from "./availability/TimeSlotForm";
import { UnavailableTimeForm } from "./availability/UnavailableTimeForm";
import { ExistingTimeSlots } from "./availability/ExistingTimeSlots";

interface MentorAvailabilityFormProps {
  mentorId: string;
}

export function MentorAvailabilityForm({ mentorId }: MentorAvailabilityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: {
    profile_id: string;
    start_date_time: string;
    end_date_time: string;
    is_available: boolean;
    recurring?: boolean;
    day_of_week?: number;
  }) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          ...formData,
          timezone_offset: new Date().getTimezoneOffset()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <TimeSlotForm 
        mentorId={mentorId} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <UnavailableTimeForm 
        mentorId={mentorId}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <ExistingTimeSlots mentorId={mentorId} />
    </div>
  );
}