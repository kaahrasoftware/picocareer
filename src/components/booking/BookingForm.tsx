import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { TimeSlotSelector } from "@/components/booking/TimeSlotSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BookingSessionType } from "@/types/session";

interface BookingFormProps {
  mentorId: string;
  selectedSessionType?: BookingSessionType;
  onClose: () => void;
}

export function BookingForm({ mentorId, selectedSessionType, onClose }: BookingFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookSession = async () => {
    if (!date || !selectedTime || !selectedSessionType) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time slot.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        toast({
          title: "Authentication Error",
          description: "Could not retrieve user information. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const menteeId = authData.user.id;

      // Format the selected date and time into a single ISO string
      const selectedDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        parseInt(selectedTime.split(':')[0]),
        parseInt(selectedTime.split(':')[1])
      ).toISOString();

      const { data, error } = await supabase
        .from('mentor_sessions')
        .insert([
          {
            mentor_id: mentorId,
            mentee_id: menteeId,
            session_type_id: selectedSessionType.id,
            scheduled_at: selectedDateTime,
            status: 'scheduled',
          },
        ]);

      if (error) {
        console.error("Error booking session:", error);
        toast({
          title: "Error",
          description: "Failed to book session. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Session booked successfully!",
        });
        navigate('/dashboard');
        onClose();
      }
    } catch (error) {
      console.error("Error booking session:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Date</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={format(date || new Date(), "PPP")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>{format(date || new Date(), "PPP")}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) =>
                date < new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {date && (
        <TimeSlotSelector
          date={date}
          mentorId={mentorId}
          selectedTime={selectedTime}
          onTimeSelect={handleTimeSelect}
          selectedSessionType={selectedSessionType}
        />
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleBookSession}>Book Session</Button>
      </div>
    </div>
  );
}

import { CalendarIcon } from "@radix-ui/react-icons"
