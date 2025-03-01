
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { MemberRole } from "@/types/database/hubs";

type ValidatedEmail = {
  email: string;
  isValid: boolean;
  exists: boolean;
  message?: string;
};

export function useAddMembers(hubId: string) {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMembers = async (
    emails: string[],
    role: MemberRole
  ): Promise<boolean> => {
    if (emails.length === 0) return false;

    setIsAdding(true);
    try {
      // Add members directly using our new RPC function
      const results = await Promise.all(
        emails.map(async (email) => {
          const { data, error } = await supabase.rpc('add_hub_member', {
            _hub_id: hubId,
            _email: email,
            _role: role
          });
          
          return { 
            email, 
            success: !error && data?.success, 
            message: error?.message || data?.message 
          };
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
