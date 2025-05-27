
import { useState, useEffect } from 'react';
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

export function useEmailCampaignFormState() {
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

  // Query for content based on content_type
  const { data: contentItems = [], isLoading } = useQuery({
    queryKey: ['email-campaign-content', formData.content_type],
    queryFn: async () => {
      if (!formData.content_type) return [];
      
      const { data, error } = await supabase
        .from(formData.content_type)
        .select('id, title, description, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!formData.content_type
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
    contentItems,
    isLoading,
    previewData,
    setPreviewData,
    updateField
  };
}
