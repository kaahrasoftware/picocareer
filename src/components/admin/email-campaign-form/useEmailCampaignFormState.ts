
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmailCampaignFormData {
  subject: string;
  body: string;
  content_type: string;
  content_id: string;
  content_ids: string[];
  scheduled_for: string;
  frequency: string;
  recipient_type: string;
  recipient_filter: Record<string, any>;
}

interface UseEmailCampaignFormStateProps {
  onSuccess?: (campaignId: string) => void;
  specificRecipientType?: string;
}

export function useEmailCampaignFormState(props: UseEmailCampaignFormStateProps = {}) {
  const [formData, setFormData] = useState<EmailCampaignFormData>({
    subject: '',
    body: '',
    content_type: '',
    content_id: '',
    content_ids: [],
    scheduled_for: '',
    frequency: 'once',
    recipient_type: 'all',
    recipient_filter: {}
  });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);

  // Query for available recipients when recipient type is 'selected'
  const { data: availableRecipients = [], isLoading: isFetchingRecipients } = useQuery({
    queryKey: ['email-recipients', props.specificRecipientType],
    queryFn: async () => {
      if (!props.specificRecipientType || props.specificRecipientType === 'all') return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: props.specificRecipientType === 'selected'
  });

  const updateField = (field: keyof EmailCampaignFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSelectedItems = (items: string[]) => {
    setSelectedItems(items);
    updateField('content_ids', items);
    
    // Set content_id to first selected item for backwards compatibility
    if (items.length > 0) {
      updateField('content_id', items[0]);
    }
  };

  return {
    formData,
    setFormData,
    selectedItems,
    updateSelectedItems,
    contentItems: [],
    isLoading: false,
    previewData,
    setPreviewData,
    updateField,
    availableRecipients,
    isFetchingRecipients
  };
}
