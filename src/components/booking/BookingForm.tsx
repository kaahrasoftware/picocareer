import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DateSelector } from "./DateSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { SessionTypeSelector } from "./SessionTypeSelector";
import { MeetingPlatformSelector } from "./MeetingPlatformSelector";
import { SessionNote } from "./SessionNote";
import { useBookSession } from "@/hooks/useBookSession";
import { useSessionTypes } from "@/hooks/useSessionTypes";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BookingFormProps {
  mentorId: string;
  onSuccess?: () => void;
}

export function BookingForm({ mentorId, onSuccess }: BookingFormProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [sessionType, setSessionType] = useState<string>();
  const [platform, setPlatform] = useState<string>();
  const [note, setNote] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch session types with error handling
  const { data: sessionTypes, isError: sessionTypesError } = useSessionTypes(mentorId);
  const { mutate: bookSession, isLoading } = useBookSession();

  // Check session on mount and when sessionTypesError changes
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.error('Session error:', error);
          // Clear any stale auth data
          await supabase.auth.signOut();
          queryClient.clear();
          localStorage.clear();
          
          toast({
            title: "Authentication required",
            description: "Please sign in to book a session",
            variant: "destructive",
          });
          navigate("/auth");
        }
      } catch (error) {
        console.error('Session check error:', error);
        navigate("/auth");
      }
    };

    if (sessionTypesError) {
      checkSession();
    }
  }, [sessionTypesError, navigate, queryClient, toast]);

  const selectedSessionTypeDetails = sessionTypes?.find(st => st.id === sessionType);
  const availablePlatforms = selectedSessionTypeDetails?.meeting_platform || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionType || !date || !selectedTime || !platform) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      bookSession(
        {
          mentorId,
          sessionTypeId: sessionType,
          scheduledAt: new Date(`${date.toDateString()} ${selectedTime}`),
          platform,
          note,
        },
        {
          onSuccess: () => {
            toast({
              title: "Session booked",
              description: "Your session has been successfully scheduled",
            });
            if (onSuccess) onSuccess();
          },
          onError: (error: any) => {
            console.error('Booking error:', error);
            if (error.message?.includes('auth') || error.message?.includes('token')) {
              navigate("/auth");
            } else {
              toast({
                title: "Booking failed",
                description: error.message || "Failed to book session. Please try again.",
                variant: "destructive",
              });
            }
          },
        }
      );
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="bg-white/5 rounded-lg p-4">
          <SessionTypeSelector
            sessionTypes={sessionTypes || []}
            selectedType={sessionType}
            onSelect={setSessionType}
          />
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <DateSelector
            date={date}
            onDateSelect={setDate}
            mentorId={mentorId}
          />
        </div>

        {sessionType && availablePlatforms.length > 0 && (
          <div 
            className="bg-white/5 rounded-lg p-4 transform transition-all duration-300 ease-in-out"
          >
            <MeetingPlatformSelector
              platforms={availablePlatforms}
              selectedPlatform={platform}
              onSelect={setPlatform}
              sessionType={selectedSessionTypeDetails}
            />
          </div>
        )}

        {date && (
          <div className="bg-white/5 rounded-lg p-4">
            <TimeSlotSelector
              date={date}
              mentorId={mentorId}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
              selectedSessionType={selectedSessionTypeDetails}
            />
          </div>
        )}

        <div className="bg-white/5 rounded-lg p-4">
          <SessionNote
            note={note}
            onChange={setNote}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading || !date || !selectedTime || !sessionType || !platform}
      >
        {isLoading ? "Booking..." : "Book Session"}
      </Button>
    </form>
  );
}