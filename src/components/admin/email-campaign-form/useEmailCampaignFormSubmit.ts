
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
      const recipientsCount = formState.recipient_type === 'selected' && formState.recipients 
        ? formState.recipients.length 
        : 0;
      
      const campaignData = {
        admin_id: adminId,
        subject: formState.subject,
        content_type: formState.content_type as ContentType || 'blogs',
        content_id: formState.content_ids?.[0] || '', // Required field - explicitly set from first item
        content_ids: formState.content_ids || [],
        recipient_type: formState.recipient_type || 'all',
        recipients: formState.recipients || [],
        scheduled_for: formState.scheduled_for,
        frequency: formState.frequency || 'weekly',
        status: 'planned', // Use 'planned' instead of 'scheduled'
        sent_count: 0, // Explicitly set to 0
        failed_count: 0, // Explicitly set to 0
        recipients_count: recipientsCount
      };

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert(campaignData)
        .select('id');

      if (error) {
        console.error('Error creating campaign:', error);
        toast.error(`Failed to create campaign: ${error.message}`);
        throw error;
      }

      toast.success('Campaign created successfully');
      
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
