
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailCampaignType } from './emailCampaign.schema';
import { ContentType } from './utils';

interface UseEmailCampaignFormSubmitProps {
  adminId: string;
  formState: Partial<EmailCampaignType>;
  onSuccess?: (campaignId: string) => void;
}

export const useEmailCampaignFormSubmit = ({ 
  adminId, 
  formState, 
  onSuccess 
}: UseEmailCampaignFormSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!adminId) {
      toast.error('Admin ID is required');
      return;
    }

    if (!formState.subject) {
      toast.error('Subject is required');
      return;
    }

    if (!formState.content_ids || formState.content_ids.length === 0) {
      toast.error('Please select at least one content item');
      return;
    }

    if (!formState.content_type) {
      toast.error('Content type is required');
      return;
    }
    
    if (!formState.scheduled_for) {
      toast.error('Scheduled date is required');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting campaign with data:', { adminId, formState });
      
      // Calculate recipients count based on type
      let recipientsCount = 0;
      
      // Create a properly structured recipient_filter
      let recipientFilter = null;
      
      if (formState.recipient_type === 'selected' && 
          formState.recipient_filter && 
          typeof formState.recipient_filter === 'object' && 
          Array.isArray(formState.recipient_filter.profile_ids)) {
        recipientsCount = formState.recipient_filter.profile_ids.length;
        recipientFilter = { profile_ids: formState.recipient_filter.profile_ids };
      } else if (formState.recipient_type === 'mentees') {
        recipientFilter = { filter_type: 'mentee' };
      } else if (formState.recipient_type === 'mentors') {
        recipientFilter = { filter_type: 'mentor' };
      } else if (formState.recipient_type === 'event_registrants' && 
                formState.recipient_filter && 
                formState.recipient_filter.event_id) {
        recipientFilter = { 
          event_id: formState.recipient_filter.event_id,
          filter_type: 'event_registrants'
        };
        
        // Calculate event registrants count
        try {
          const { count, error } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact' })
            .eq('event_id', formState.recipient_filter.event_id);
            
          if (!error) {
            recipientsCount = count || 0;
          }
        } catch (err) {
          console.error('Error counting event registrants:', err);
        }
      }
      
      // First, ensure the session is refreshed before submitting
      console.log('Refreshing auth session before campaign creation...');
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError) {
        console.error('Error refreshing session:', sessionError);
        toast.error(`Session error: ${sessionError.message}`);
        
        // If session refresh fails, try getting the current session
        const { data: currentSession } = await supabase.auth.getSession();
        if (!currentSession.session) {
          toast.error('Your session has expired. Please log in again.');
          throw new Error('Authentication error: Session expired');
        }
      }
      
      // Additional check to ensure we have an authenticated session
      if (!sessionData?.session) {
        const { data: currentSession } = await supabase.auth.getSession();
        if (!currentSession.session) {
          toast.error('Not authenticated. Please log in again.');
          throw new Error('Not authenticated');
        }
        console.log('Using current session:', currentSession.session.user?.id);
      } else {
        console.log('Session refreshed successfully:', sessionData.session.user?.id);
      }
      
      const campaignData = {
        admin_id: adminId,
        subject: formState.subject,
        content_type: formState.content_type as ContentType || 'blogs',
        content_id: formState.content_ids?.[0] || '', // Required field - explicitly set from first item
        content_ids: formState.content_ids || [],
        recipient_type: formState.recipient_type || 'all',
        recipient_filter: recipientFilter,
        scheduled_for: formState.scheduled_for,
        frequency: formState.frequency || 'weekly',
        status: 'planned', // Use 'planned' instead of 'scheduled'
        sent_count: 0, // Explicitly set to 0
        failed_count: 0, // Explicitly set to 0
        recipients_count: recipientsCount
      };

      console.log('Submitting campaign data:', campaignData);

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert(campaignData)
        .select('id');

      if (error) {
        console.error('Error creating campaign:', error);
        toast.error(`Failed to create campaign: ${error.message}`);
        throw error;
      }

      // Removed the success toast from here as it's now in AdminEmailCampaigns
      
      if (data && data[0] && onSuccess) {
        onSuccess(data[0].id);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create campaign: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
};
