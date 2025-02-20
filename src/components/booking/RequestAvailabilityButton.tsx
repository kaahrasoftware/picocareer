
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface RequestAvailabilityButtonProps {
  mentorId: string;
  userId?: string;
  onRequestComplete: () => void;
}

export function RequestAvailabilityButton({ mentorId, userId, onRequestComplete }: RequestAvailabilityButtonProps) {
  const [isRequestingAvailability, setIsRequestingAvailability] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRequestAvailability = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request mentor availability.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      setIsRequestingAvailability(true);

      // Check if user has already requested in the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: existingRequest } = await supabase
        .from('availability_requests')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('mentee_id', userId)
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .single();

      if (existingRequest) {
        toast({
          title: "Request Limit Reached",
          description: "You can only request availability once every 24 hours.",
          variant: "destructive",
        });
        return;
      }

      // Insert new request
      const { error: insertError } = await supabase
        .from('availability_requests')
        .insert({
          mentor_id: mentorId,
          mentee_id: userId
        });

      if (insertError) throw insertError;

      // Notify mentor via edge function
      const { error: notifyError } = await supabase.functions.invoke('notify-mentor-availability', {
        body: {
          mentorId,
          menteeId: userId
        }
      });

      if (notifyError) throw notifyError;

      toast({
        title: "Request Sent",
        description: "The mentor has been notified of your request.",
      });
      
      onRequestComplete();
    } catch (error) {
      console.error('Error requesting availability:', error);
      toast({
        title: "Error",
        description: "Failed to send availability request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRequestingAvailability(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-center space-y-3 bg-muted p-4 rounded-lg">
      <p className="text-muted-foreground text-center">
        No available time slots for the selected date.
      </p>
      <Button
        variant="secondary"
        onClick={handleRequestAvailability}
        disabled={isRequestingAvailability}
        className="w-full max-w-sm"
      >
        {isRequestingAvailability ? "Sending Request..." : "Request Availability"}
      </Button>
    </div>
  );
}
