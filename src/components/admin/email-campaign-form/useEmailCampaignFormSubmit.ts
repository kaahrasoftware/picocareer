
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailCampaignType } from './emailCampaign.schema';

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

    setIsSubmitting(true);

    try {
      const campaignData = {
        admin_id: adminId,
        subject: formState.subject,
        content_type: formState.content_type || 'blog',
        content_ids: formState.content_ids,
        recipient_type: formState.recipient_type || 'all',
        recipient_ids: formState.recipients,
        scheduled_for: formState.scheduled_for,
        frequency: formState.frequency || 'weekly',
        status: 'scheduled'
      };

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert(campaignData)
        .select('id');

      if (error) {
        throw error;
      }

      toast.success('Campaign created successfully');
      
      if (data && data[0] && onSuccess) {
        onSuccess(data[0].id);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
};
