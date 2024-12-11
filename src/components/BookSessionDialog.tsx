import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DateSelector } from "./booking/DateSelector";
import { TimeSlotSelector } from "./booking/TimeSlotSelector";
import { SessionTypeSelector } from "./booking/SessionTypeSelector";
import { SessionNote } from "./booking/SessionNote";

interface BookSessionDialogProps {
  mentor: {
    id: string;
    name: string;
    imageUrl: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface SessionType {
  id: string;
  type: string;
  duration: number;
  price: number;
  description: string | null;
}

export function BookSessionDialog({ mentor, open, onOpenChange }: BookSessionDialogProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [sessionType, setSessionType] = useState<string>();
  const [note, setNote] = useState("");
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    async function fetchSessionTypes() {
      if (!mentor.id) {
        toast({
          title: "Error",
          description: "Invalid mentor ID",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', mentor.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load session types",
          variant: "destructive",
        });
        return;
      }

      setSessionTypes(data);
    }

    if (open && mentor.id) {
      fetchSessionTypes();
    }
  }, [mentor.id, open, toast]);

  useEffect(() => {
    async function fetchAvailability() {
      if (!date || !mentor.id) return;

      const dayOfWeek = date.getDay();
      
      const { data: availabilityData, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', mentor.id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load availability",
          variant: "destructive",
        });
        return;
      }

      // Check existing bookings for this date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: bookingsData } = await supabase
        .from('mentor_sessions')
        .select('scheduled_at')
        .eq('mentor_id', mentor.id)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .neq('status', 'cancelled');

      // Generate available time slots
      const slots: TimeSlot[] = [];
      availabilityData?.forEach((availability) => {
        const [startHour] = availability.start_time.split(':');
        const [endHour] = availability.end_time.split(':');
        
        for (let hour = parseInt(startHour); hour < parseInt(endHour); hour++) {
          const timeString = `${hour.toString().padStart(2, '0')}:00`;
          const isBooked = bookingsData?.some(booking => {
            const bookingHour = new Date(booking.scheduled_at).getHours();
            return bookingHour === hour;
          });
          
          slots.push({
            time: timeString,
            available: !isBooked
          });
        }
      });

      setAvailableTimeSlots(slots);
    }

    if (date && mentor.id) {
      fetchAvailability();
    }
  }, [date, mentor.id, toast]);

  const handleSubmit = async () => {
    if (!date || !selectedTime || !sessionType || !mentor.id) return;

    const scheduledAt = new Date(date);
    const [hours, minutes] = selectedTime.split(':');
    scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const { error } = await supabase
      .from('mentor_sessions')
      .insert({
        mentor_id: mentor.id,
        mentee_id: (await supabase.auth.getUser()).data.user?.id,
        session_type_id: sessionType,
        scheduled_at: scheduledAt.toISOString(),
        notes: note,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Session booked successfully",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-kahra-dark text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Book a Session with {mentor.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DateSelector
            date={date}
            onDateSelect={setDate}
            userTimezone={userTimezone}
          />

          <div className="space-y-6">
            {date && (
              <TimeSlotSelector
                date={date}
                availableTimeSlots={availableTimeSlots}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
              />
            )}

            <SessionTypeSelector
              sessionTypes={sessionTypes}
              onSessionTypeSelect={setSessionType}
            />

            <SessionNote
              note={note}
              onNoteChange={setNote}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!date || !selectedTime || !sessionType || !mentor.id}
          >
            Book Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}