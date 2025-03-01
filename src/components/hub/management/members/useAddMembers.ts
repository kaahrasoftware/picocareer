
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { MemberRole } from "@/types/database/hubs";
import type { ValidatedEmail } from "../invite/useEmailValidation";

export function useAddMembers(hubId: string) {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMembers = async (
    validatedEmails: ValidatedEmail[],
    role: MemberRole
  ): Promise<boolean> => {
    if (validatedEmails.length === 0) return false;

    setIsAdding(true);
    try {
      // Filter valid emails that exist in the system
      const validEmails = validatedEmails
        .filter(e => e.isValid && e.exists)
        .map(e => e.email);

      if (validEmails.length === 0) {
        toast({
          title: "No valid emails",
          description: "Please enter at least one valid email that exists in the system",
          variant: "destructive",
        });
        return false;
      }

      // Add members one by one using the RPC function
      const results = await Promise.all(
        validEmails.map(async (email) => {
          const { data, error } = await supabase.rpc('add_hub_member', {
            _hub_id: hubId,
            _email: email,
            _role: role
          });
          
          return { email, success: !error, message: error?.message || data.message };
        })
      );

      // Count successes and failures
      const successes = results.filter(r => r.success).length;
      const failures = results.filter(r => !r.success).length;

      // Show a toast with the result
      if (successes > 0) {
        toast({
          title: `${successes} member${successes > 1 ? 's' : ''} added`,
          description: "Members have been notified of their membership",
        });
        
        // Refresh member lists
        queryClient.invalidateQueries({
          queryKey: ['hub-members-management', hubId]
        });
        
        return true;
      } else {
        toast({
          title: "Failed to add members",
          description: `${failures} email${failures > 1 ? 's' : ''} could not be processed`,
          variant: "destructive",
        });
      }
      
      return false;
    } catch (error) {
      console.error('Error adding members:', error);
      toast({
        title: "Error",
        description: "Failed to add members. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return { isAdding, addMembers };
}
