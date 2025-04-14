
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface RequestAvailabilityButtonProps {
  mentorId: string | undefined;
  userId: string | undefined;
  onRequestComplete: () => void;
}

export function RequestAvailabilityButton({
  mentorId,
  userId,
  onRequestComplete
}: RequestAvailabilityButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRequest = async () => {
    if (!mentorId || !userId) {
      toast({
        title: "Error",
        description: "You must be logged in to request availability",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if there's an existing request
      const { data: existingRequest, error: checkError } = await supabase
        .from('availability_requests')
        .select('id, status')
        .eq('mentor_id', mentorId)
        .eq('mentee_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingRequest) {
        toast({
          title: "Request Already Exists",
          description: "You already have a pending request with this mentor",
          variant: "default"
        });
        setIsDialogOpen(false);
        onRequestComplete();
        return;
      }

      // Create the availability request
      const { error } = await supabase
        .from('availability_requests')
        .insert({
          mentor_id: mentorId,
          mentee_id: userId,
          message: message.trim() || "I'd like to schedule a session with you. Please add more availability.",
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      // Notify the mentor about the request
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          profile_id: mentorId,
          title: 'Availability Request',
          message: 'A mentee has requested more availability options from you.',
          type: 'availability_request',
          category: 'mentorship',
          action_url: '/profile?tab=mentor'
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      toast({
        title: "Request Sent",
        description: "Your availability request has been sent to the mentor",
        variant: "default"
      });

      setIsDialogOpen(false);
      onRequestComplete();
    } catch (error: any) {
      console.error('Error requesting availability:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to request availability",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="w-full"
        size="sm"
      >
        Request More Availability
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request More Availability</DialogTitle>
            <DialogDescription>
              Ask the mentor to add more availability slots that work for your schedule.
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-muted/50 border-muted-foreground/20">
            <Info className="h-4 w-4" />
            <AlertDescription>
              The mentor will receive your request and may add more time slots. You'll be notified when they update their availability.
            </AlertDescription>
          </Alert>

          <div className="py-2">
            <Textarea
              placeholder="Add a message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
