
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SessionReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  participantName: string;
  onSuccess?: () => void;
}

export function SessionReminderDialog({
  isOpen,
  onClose,
  sessionId,
  participantName,
  onSuccess
}: SessionReminderDialogProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendReminder = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-session-reminder', {
        body: {
          sessionId,
          customMessage: message
        }
      });

      if (error) throw error;

      toast({
        title: "Reminder sent",
        description: "Your reminder has been sent successfully.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Failed to send reminder",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Session Reminder</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="text-sm">
            <p>Send a reminder to <span className="font-medium">{participantName}</span> about your upcoming session.</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Additional message (optional)</p>
            <Textarea
              placeholder="Add a personalized message to your reminder..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendReminder}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reminder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
