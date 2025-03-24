
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAdminNotification } from "./mentor/useAdminNotification";
import { useUserRegistration } from "./mentor/useUserRegistration";
import { useMentorReferenceData } from "./mentor/useMentorReferenceData";
import { useMentorDataFormatter } from "./mentor/useMentorDataFormatter";

export function useMentorRegistration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useAuthSession();
  const { sendAdminNotification } = useAdminNotification();
  const { registerNewUser } = useUserRegistration();
  const { formatMentorData } = useMentorDataFormatter();
  const referenceData = useMentorReferenceData();
  
  const onSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Raw form data:', data);
    
    try {
      // Determine if this is a new user or existing user
      let user;
      
      if (session?.user) {
        console.log('Using existing authenticated user:', session.user.id);
        user = session.user;
      } else {
        // For new users, validate password
        if (!data.password) {
          throw new Error("Password is required for new user registration");
        }
        
        // Register the new user first
        user = await registerNewUser(data);
        
        // Wait briefly for auth state to update
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Verify user exists
      if (!user?.id) {
        throw new Error("User authentication failed");
      }

      const formattedData = formatMentorData(data, user.id);

      console.log('Formatted data for submission:', formattedData);

      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(formattedData);

      if (upsertError) {
        console.error('Database upsert error:', upsertError);
        throw upsertError;
      }

      console.log('Upsert response:', upsertData);

      await sendAdminNotification(formattedData);

      toast({
        title: "Application Received",
        description: "Thank you for applying to be a mentor! Our team will review your application and conduct a background check. We'll reach out to you soon.",
        variant: "default"
      });

      // Redirect to home page for better experience
      navigate('/');
    } catch (error: any) {
      console.error('Error registering mentor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit mentor application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    onSubmit,
    ...referenceData
  };
}
