
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SendReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  senderId: string;
}

export function SendReminderDialog({
  isOpen,
  onClose,
  sessionId,
  senderId,
}: SendReminderDialogProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendReminder = async () => {
    setIsLoading(true);
    try {
      // Get session details to identify mentee
      const { data: session, error: sessionError } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          scheduled_at,
          mentor_id,
          mentee_id,
          mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name, email),
          mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name, email),
          session_type:mentor_session_types!mentor_sessions_session_type_id_fkey(type, duration)
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      
      // Verify sender is the mentor
      if (session.mentor_id !== senderId) {
        throw new Error("Only the mentor can send session reminders");
      }

      const customMessage = message.trim() 
        ? message 
        : `This is a reminder for our upcoming mentoring session.`;

      // Call the edge function to send the reminder
      const { error } = await supabase.functions.invoke('send-session-reminder', {
        body: {
          sessionId,
          senderId,
          customMessage
        }
      });

      if (error) throw error;
      
      toast({
        title: "Reminder sent",
        description: "The session reminder has been sent successfully.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast({
        title: "Failed to send reminder",
        description: error.message || "An error occurred while sending the reminder.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Session Reminder</DialogTitle>
          <DialogDescription>
            Send a reminder to the mentee about the upcoming session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Custom message (optional)
            </label>
            <Textarea
              id="message"
              placeholder="Add a personalized message to your reminder..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-24"
            />
            <p className="text-xs text-muted-foreground">
              If left empty, a default reminder message will be sent.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendReminder} 
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
