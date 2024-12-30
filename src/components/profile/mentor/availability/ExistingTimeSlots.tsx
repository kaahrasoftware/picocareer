import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  id: string;
  profile_id: string;
  start_date_time: string;
  end_date_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week: number | null;
}

interface ExistingTimeSlotsProps {
  slots: TimeSlot[];
  onDelete: (id: string) => void;
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
    <div className="space-y-4">
      <h4 className="font-medium">Existing Time Slots</h4>
      <div className="space-y-2">
        {slots.map((slot) => {
          const startDate = new Date(slot.start_date_time);
          const formattedDate = format(startDate, 'MMM d, yyyy');
          
          // Convert times to both user's and mentor's timezone
          const startTimeUser = formatInTimeZone(
            startDate,
            userTimezone,
            'h:mm a'
          );
          const endTimeUser = formatInTimeZone(
            new Date(slot.end_date_time),
            userTimezone,
            'h:mm a'
          );

          const startTimeMentor = formatInTimeZone(
            startDate,
            mentorTimezone,
            'h:mm a'
          );
          const endTimeMentor = formatInTimeZone(
            new Date(slot.end_date_time),
            mentorTimezone,
            'h:mm a'
          );

          return (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-lg border p-4"
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
                  {slot.recurring && (
                    <span className="text-primary">Recurring weekly</span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(slot.id)}
              >
                Delete
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}