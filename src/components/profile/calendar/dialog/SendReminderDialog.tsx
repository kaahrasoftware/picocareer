
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
      // Call the edge function to send the reminder
      const { error } = await supabase.functions.invoke('send-session-reminder', {
        body: {
          sessionId,
          senderId,
          customMessage: message.trim()
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
              Add a personal message (optional)
            </label>
            <Textarea
              id="message"
              placeholder="Looking forward to our session!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSendReminder} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
