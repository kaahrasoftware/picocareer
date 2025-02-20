
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

      // Insert new request
      const { error: insertError } = await supabase
        .from('availability_requests')
        .insert({
          mentor_id: mentorId,
          mentee_id: userId
        });

      // Handle duplicate request error
      if (insertError?.message?.includes('unique_mentor_mentee_request')) {
        toast({
          title: "Request Already Sent",
          description: "You have already requested availability from this mentor.",
          variant: "destructive",
        });
        return;
      }

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
        Want to schedule a session but don't see a suitable time slot?
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
