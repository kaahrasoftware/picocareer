
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MemberRole } from "@/types/database/hubs";
import { EmailValidationResult } from "./useEmailValidation";

export function useInviteMember(hubId: string) {
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const sendInvites = async (validatedEmails: EmailValidationResult[], selectedRole: MemberRole) => {
    try {
      setIsInviting(true);
      
      // Filter only existing users
      const validEmails = validatedEmails.filter(result => result.exists).map(result => result.email);
      
      if (validEmails.length === 0) {
        toast({
          title: "No valid emails",
          description: "Please enter valid email addresses of existing users.",
          variant: "destructive",
        });
        return false;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      let successCount = 0;
      // Process each valid email
      for (const email of validEmails) {
        try {
          // Use the new add_hub_member function
          const { data, error } = await supabase.rpc('add_hub_member', {
            _hub_id: hubId,
            _email: email,
            _role: selectedRole
          });

          if (error) {
            console.error('Error adding member:', error);
            toast({
              title: "Error",
              description: `Failed to add ${email}. ${error.message}`,
              variant: "destructive",
            });
            continue;
          }

          if (data && data.success) {
            successCount++;
          } else if (data) {
            toast({
              title: "Info",
              description: data.message || `Could not add ${email}.`,
            });
          }
        } catch (error) {
          console.error('Error processing invitation for', email, ':', error);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Members added",
          description: `Successfully added ${successCount} member${successCount > 1 ? 's' : ''}.`,
        });
        return true;
      } else {
        toast({
          title: "No members added",
          description: "Failed to add any members. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error adding members:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add members. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsInviting(false);
    }
  };

  return {
    isInviting,
    sendInvites
  };
}
