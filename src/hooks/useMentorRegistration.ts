
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { useAuthSession } from "@/hooks/useAuthSession";

type UserType = Database["public"]["Enums"]["user_type"];

export function useMentorRegistration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useAuthSession();

  const { data: careers } = useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('id, title')
        .eq('status', 'Approved');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'Approved');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'Approved');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .eq('status', 'Approved');
      
      if (error) throw error;
      return data;
    }
  });

  const sendAdminNotification = async (mentorData: any) => {
    try {
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'admin');

      if (!adminProfiles?.length) {
        console.warn('No admin profiles found to notify');
        return;
      }

      const notifications = adminProfiles.map(admin => ({
        profile_id: admin.id,
        title: 'New Mentor Application',
        message: `${mentorData.first_name} ${mentorData.last_name} has applied to become a mentor.`,
        type: 'mentor_request' as const,
        action_url: '/admin/mentors/pending'
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error sending admin notifications:', notificationError);
      }
    } catch (error) {
      console.error('Error in sendAdminNotification:', error);
    }
  };

  // Create or update user for mentor registration
  const createOrUpdateUser = async (data: any) => {
    const userEmail = data.email.toLowerCase();
    console.log('Processing registration for:', userEmail);
    
    try {
      // Check if user is already logged in
      if (session?.user) {
        console.log('User is logged in, using current session for mentor registration');
        return { userId: session.user.id, isNewUser: false };
      }
      
      // Check if user exists in profiles
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('email', userEmail)
        .maybeSingle();

      if (profileError) {
        console.error('Profile check error:', profileError);
        throw new Error('Error checking user profile');
      }

      // If user exists and is a mentor, show error
      if (existingProfile?.user_type === 'mentor') {
        toast({
          title: "Already Registered",
          description: "You are already registered as a mentor. Your application is under review.",
          variant: "destructive",
        });
        throw new Error('Already registered as mentor');
      }

      // If existing profile but not logged in, ask to login
      if (existingProfile && !session) {
        toast({
          title: "Login Required",
          description: "Please login to your existing account to continue with mentor registration.",
          variant: "destructive",
        });
        navigate("/auth");
        throw new Error('Login required for existing account');
      }

      // If no existing profile and not logged in, create new user
      if (!existingProfile && !session) {
        console.log('Creating new user account');
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: data.password,
          options: {
            data: {
              first_name: data.first_name,
              last_name: data.last_name
            }
          }
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          
          if (signUpError.message.includes('User already registered')) {
            toast({
              title: "Login Required",
              description: "An account with this email already exists. Please login to continue.",
              variant: "destructive",
            });
            navigate("/auth");
            throw new Error('Login required for existing account');
          }
          throw signUpError;
        }

        console.log('New user created successfully');
        return { userId: authData.user?.id, isNewUser: true };
      }

      // Use current user session
      return { userId: session?.user?.id, isNewUser: false };
    } catch (error: any) {
      console.error('User creation/verification error:', error);
      throw error;
    }
  };

  const onSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Raw form data:', data);
    
    try {
      // Step 1: Create or verify user account
      const { userId, isNewUser } = await createOrUpdateUser(data);
      
      if (!userId) {
        throw new Error("Unable to determine user ID for mentor registration");
      }

      console.log('Processing mentor registration for user:', userId);

      // Step 2: Format mentor profile data
      const formattedData = {
        id: userId,
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim(),
        avatar_url: data.avatar_url,
        bio: data.bio.trim(),
        years_of_experience: Number(data.years_of_experience),
        linkedin_url: data.linkedin_url.trim(),
        github_url: data.github_url?.trim() || null,
        website_url: data.website_url?.trim() || null,
        skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        tools_used: data.tools_used.split(',').map((s: string) => s.trim()).filter(Boolean),
        keywords: data.keywords.split(',').map((s: string) => s.trim()).filter(Boolean),
        fields_of_interest: data.fields_of_interest.split(',').map((s: string) => s.trim()).filter(Boolean),
        highest_degree: data.highest_degree,
        position: data.position,
        company_id: data.company_id,
        school_id: data.school_id,
        academic_major_id: data.academic_major_id,
        location: data.location.trim(),
        user_type: 'mentor' as UserType,
        X_url: data.X_url?.trim() || null,
        facebook_url: data.facebook_url?.trim() || null,
        instagram_url: data.instagram_url?.trim() || null,
        tiktok_url: data.tiktok_url?.trim() || null,
        youtube_url: data.youtube_url?.trim() || null,
        languages: data.languages ? 
          data.languages.split(',')
            .map((lang: string) => lang.trim())
            .filter(Boolean)
          : null,
        onboarding_status: 'Pending' as const
      };

      console.log('Formatted data for submission:', formattedData);

      // Step 3: Insert/update mentor profile
      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(formattedData, { onConflict: 'id' });

      if (upsertError) {
        console.error('Database upsert error:', upsertError);
        throw upsertError;
      }

      console.log('Mentor profile updated successfully');

      // Step 4: Send admin notification
      await sendAdminNotification(formattedData);

      // Step 5: Show success message
      if (isNewUser) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your spam folder if you don't see it.",
        });
      } else {
        toast({
          title: "Application Received",
          description: "Thank you for applying to be a mentor! Our team will review your application and conduct a background check. We'll reach out to you soon.",
          variant: "default"
        });
      }

      // For existing users, reload to update UI
      if (!isNewUser) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error registering mentor:', error);
      if (error.message !== 'Already registered as mentor' && 
          error.message !== 'Login required for existing account') {
        toast({
          title: "Error",
          description: error.message || "Failed to submit mentor application. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    onSubmit,
    careers,
    companies,
    schools,
    majors
  };
}
