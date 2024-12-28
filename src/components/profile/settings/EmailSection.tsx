import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailSectionProps {
  currentEmail: string;
}

export function EmailSection({ currentEmail }: EmailSectionProps) {
  const [email, setEmail] = useState(currentEmail);
  const { toast } = useToast();

  const handleEmailUpdate = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email });
      
      if (error) throw error;

      toast({
        title: "Email update requested",
        description: "Please check your new email for confirmation.",
      });
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="email">Email Address</Label>
      </div>
      <div className="flex gap-4">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
        />
        <Button 
          onClick={handleEmailUpdate}
          disabled={email === currentEmail}
        >
          Update Email
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Changing your email will require confirmation via the new email address.
      </p>
    </div>
  );
}