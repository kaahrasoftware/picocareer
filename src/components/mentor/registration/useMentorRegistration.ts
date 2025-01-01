import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type UserType = Database["public"]["Enums"]["user_type"];

export function useMentorRegistration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Raw form data:', data);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to register as a mentor",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const formattedData = {
        id: user.id,
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

      window.location.reload();
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
    careers,
    companies,
    schools,
    majors
  };
}