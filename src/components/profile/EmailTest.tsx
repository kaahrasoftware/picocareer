import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function EmailTest() {
  const { toast } = useToast();

  const handleTestEmail = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-session-email', {
        query: { test: 'true' }
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent",
        description: "Check your inbox for the test email",
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email. Check the console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <Button onClick={handleTestEmail}>
        Send Test Email
      </Button>
    </div>
  );
}