
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface RequestAvailabilityButtonProps {
  mentorId: string;
  userId?: string;
  onRequestComplete: () => void;
}

export function RequestAvailabilityButton({ 
  mentorId, 
  userId, 
  onRequestComplete 
}: RequestAvailabilityButtonProps) {
  const [isRequestingAvailability, setIsRequestingAvailability] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if mentor has any future availability
  const { data: hasFutureAvailability, isLoading } = useQuery({
    queryKey: ['mentorFutureAvailability', mentorId],
    queryFn: async () => {
      const now = new Date();
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('id')
        .eq('profile_id', mentorId)
        .eq('is_available', true)
        .or(`and(recurring.eq.true),and(recurring.eq.false,start_date_time.gt.${now.toISOString()})`)
        .limit(1);

      if (error) {
        console.error('Error checking mentor availability:', error);
        return true; // Return true on error to prevent unnecessary requests
      }

      return (data?.length ?? 0) > 0;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

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

    if (hasFutureAvailability) {
      toast({
        title: "Mentor is Available",
        description: "This mentor already has available time slots. Please check their calendar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRequestingAvailability(true);
      
      // Remove dashes from IDs before database operations
      const cleanMentorId = mentorId.replace(/-/g, '');
      const cleanUserId = userId.replace(/-/g, '');
      
      console.log('Starting availability request process...', { cleanMentorId, cleanUserId });

      // Check for existing pending request
      const { data: existingRequest, error: checkError } = await supabase
        .from('availability_requests')
        .select('*')
        .eq('mentor_id', cleanMentorId)
        .eq('mentee_id', cleanUserId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequest) {
        toast({
          title: "Request Already Sent",
          description: "You have already requested availability from this mentor.",
          variant: "destructive",
        });
        return;
      }

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

      if (insertError) {
        console.error('Error creating request:', insertError);
        throw insertError;
      }

      console.log('Availability request created:', requestData);

      try {
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

        console.log('Notification response:', notifyData);

        if (notifyError) {
          console.error('Error notifying mentor:', notifyError);
          throw notifyError;
        }

        toast({
          title: "Request Sent",
          description: "The mentor has been notified of your request.",
        });
        
        onRequestComplete();
      } catch (notifyError: any) {
        console.error('Error in notification process:', notifyError);
        // Don't rethrow the error - we still created the request successfully
        toast({
          title: "Request Sent",
          description: "Request created but there was an issue sending the notification. The mentor will still be notified via the platform.",
        });
        onRequestComplete();
      }
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

  // Don't show the button if the mentor has future availability
  if (hasFutureAvailability) {
    return null;
  }

  // Show loading state while checking availability
  if (isLoading) {
    return null;
  }

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
