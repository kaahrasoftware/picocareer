
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
        try {
          user = await registerNewUser(data);
        } catch (error: any) {
          console.error('User registration error:', error);
          // Provide detailed error messages for auth errors
          if (error.message.includes('password')) {
            throw new Error(`Password error: ${error.message}`);
          } else if (error.message.includes('email')) {
            throw new Error(`Email error: ${error.message}`);
          } else {
            throw new Error(`Registration error: ${error.message}`);
          }
        }
        
        // Wait briefly for auth state to update
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Verify user exists
      if (!user?.id) {
        throw new Error("User authentication failed. Please try logging in again.");
      }

      const formattedData = formatMentorData(data, user.id);

      console.log('Formatted data for submission:', formattedData);

      try {
        const { data: upsertData, error: upsertError } = await supabase
          .from('profiles')
          .upsert(formattedData);

        if (upsertError) {
          console.error('Database upsert error:', upsertError);
          // Transform database errors into user-friendly messages
          if (upsertError.code === '23505') {
            throw new Error("A profile with this information already exists.");
          } else if (upsertError.message.includes('violates row-level security policy')) {
            throw new Error("Permission error: Unable to create your profile. Please ensure you're properly logged in.");
          } else {
            throw upsertError;
          }
        }

        console.log('Upsert response:', upsertData);
      } catch (error: any) {
        console.error('Error during profile creation:', error);
        throw error;
      }

      try {
        await sendAdminNotification(formattedData);
      } catch (notificationError) {
        console.error('Admin notification error (non-critical):', notificationError);
        // Don't fail the whole process for notification errors
      }

      toast({
        title: "Application Received",
        description: "Thank you for applying to be a mentor! Our team will review your application and conduct a background check. We'll reach out to you soon.",
        variant: "default"
      });

      // Redirect to home page for better experience
      navigate('/');
    } catch (error: any) {
      console.error('Error registering mentor:', error);
      
      // Ensure we extract a reasonable error message
      let errorMessage = "Failed to submit mentor application. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = error.message || errorMessage;
        
        // Handle Supabase specific errors
        if (error.code === '42501') {
          errorMessage = "You don't have permission to perform this action. Please check that you're logged in.";
        } else if (error.code === '23505') {
          errorMessage = "A profile with this information already exists.";
        } else if (error.code && error.details) {
          errorMessage = `Error (${error.code}): ${error.details}`;
        }
      }
      
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error; // Re-throw so the form can handle the error display
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
