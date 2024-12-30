import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';
import { Trash2, Clock } from "lucide-react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  timezone: string;
  date_available: string;
  profile_id: string;
}

interface ExistingTimeSlotsProps {
  slots: TimeSlot[];
  onDelete: (slotId: string) => void;
}

export function ExistingTimeSlots({ slots, onDelete }: ExistingTimeSlotsProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const userTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch mentor's timezone from user_settings
  const { data: mentorSettings } = useQuery({
    queryKey: ['mentor-timezone', slots[0]?.profile_id],
    queryFn: async () => {
      if (!slots[0]?.profile_id) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', slots[0]?.profile_id)
        .eq('setting_type', 'timezone')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slots[0]?.profile_id
  });

  const mentorTimezone = mentorSettings?.setting_value || 'UTC';

  if (slots.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      <h4 className="font-medium">Available Time Slots</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {slots.map((slot) => {
          const date = new Date(slot.date_available);
          const formattedDate = format(date, 'MMM d, yyyy');
          
          // Convert times to both user's and mentor's timezone
          const startTimeUser = formatInTimeZone(
            `${slot.date_available}T${slot.start_time}`,
            userTimezone,
            'h:mm a'
          );
          const endTimeUser = formatInTimeZone(
            `${slot.date_available}T${slot.end_time}`,
            userTimezone,
            'h:mm a'
          );

          const startTimeMentor = formatInTimeZone(
            `${slot.date_available}T${slot.start_time}`,
            mentorTimezone,
            'h:mm a'
          );
          const endTimeMentor = formatInTimeZone(
            `${slot.date_available}T${slot.end_time}`,
            mentorTimezone,
            'h:mm a'
          );

          return (
            <div 
              key={slot.id}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {startTimeUser} - {endTimeUser}
                </span>
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{formattedDate}</span>
                  </div>
                  <span>Your timezone: {userTimezone}</span>
                  <span>Mentor's time: {startTimeMentor} - {endTimeMentor} ({mentorTimezone})</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(slot.id)}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}