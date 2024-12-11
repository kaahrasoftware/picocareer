import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface BookSessionDialogProps {
  mentor: {
    id: string;
    name: string;
    imageUrl: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SessionType {
  id: string;
  type: string;
  duration: number;
  price: number;
  description: string | null;
}

interface TimeSlot {
  time: string;
  available: boolean;
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

  // Fetch session types for this mentor
  useEffect(() => {
    async function fetchSessionTypes() {
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

    if (open) {
      fetchSessionTypes();
    }
  }, [mentor.id, open, toast]);

  // Fetch available time slots when date changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!date) return;

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

      // Generate available time slots based on availability and bookings
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

    if (date) {
      fetchAvailability();
    }
  }, [date, mentor.id, toast]);

  const handleSubmit = async () => {
    if (!date || !selectedTime || !sessionType) return;

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
          <div>
            <h4 className="font-semibold mb-2">Select Date</h4>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="bg-kahra-darker rounded-lg p-4"
              disabled={(date) => date < new Date()}
            />
            <div className="mt-4 text-sm text-gray-400">
              <p>Your timezone: {userTimezone}</p>
            </div>
          </div>

          <div className="space-y-6">
            {date && (
              <div>
                <h4 className="font-semibold mb-2">
                  Available Times for {format(date, "MMMM d, yyyy")}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableTimeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className="w-full"
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Session Type</h4>
              <Select onValueChange={setSessionType}>
                <SelectTrigger className="w-full bg-kahra-darker border-none">
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent className="bg-kahra-darker border-none">
                  {sessionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.type} ({type.duration} min) - ${type.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Note for the Meeting</h4>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Share what you'd like to discuss..."
                className="bg-kahra-darker border-none resize-none h-32"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!date || !selectedTime || !sessionType}
          >
            Book Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}