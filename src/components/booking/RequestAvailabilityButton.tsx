
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
      
      // Remove dashes from IDs before database operations
      const cleanMentorId = mentorId.replace(/-/g, '');
      const cleanUserId = userId.replace(/-/g, '');
      
      console.log('Starting availability request process...', { cleanMentorId, cleanUserId });

      // Insert new request
      const { data: requestData, error: insertError } = await supabase
        .from('availability_requests')
        .insert({
          mentor_id: cleanMentorId,
          mentee_id: cleanUserId,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError?.message?.includes('unique_mentor_mentee_request')) {
        toast({
          title: "Request Already Sent",
          description: "You have already requested availability from this mentor.",
          variant: "destructive",
        });
        return;
      }

      if (insertError) {
        console.error('Error creating request:', insertError);
        throw insertError;
      }

      console.log('Availability request created:', requestData);

      // Call the edge function to notify mentor
      const { data: notifyData, error: notifyError } = await supabase.functions.invoke(
        'notify-mentor-availability',
        {
          body: JSON.stringify({
            mentorId: cleanMentorId,
            menteeId: cleanUserId,
            requestId: requestData.id
          })
        }
      );

      if (notifyError) {
        console.error('Error notifying mentor:', notifyError);
        throw notifyError;
      }

      console.log('Notification response:', notifyData);

      // Create a notification in the database
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          profile_id: cleanMentorId,
          title: "New Availability Request",
          message: "A mentee has requested your availability for mentoring sessions.",
          type: "mentor_request",
          action_url: `/profile?tab=calendar`,
          category: "mentorship"
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        throw notificationError;
      }

      toast({
        title: "Request Sent",
        description: "The mentor has been notified of your request.",
      });
      
      onRequestComplete();
    } catch (error: any) {
      console.error('Error requesting availability:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send availability request. Please try again later.",
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
