
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuthSession } from '@/hooks/useAuthSession';
import { supabase } from '@/integrations/supabase/client';
import { EmailCampaignSchema, EmailCampaignType } from './emailCampaign.schema';
import { useDebounce } from '@/hooks/useDebounce';
import type { Campaign } from '@/types/database/email';

interface UseEmailCampaignFormStateProps {
  campaign?: EmailCampaignType | null;
  onSuccess?: (campaignId?: string) => void;
}

export const useEmailCampaignFormState = ({ campaign, onSuccess }: UseEmailCampaignFormStateProps = {}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    recipientType: 'all',
    recipients: [] as string[],
    recipientFilter: null as string | null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [availableRecipients, setAvailableRecipients] = useState<Array<{id: string, full_name?: string, email: string}>>([]);
  const [isFetchingRecipients, setIsFetchingRecipients] = useState(false);
  const { session } = useAuthSession();

  const form = useForm<EmailCampaignType>({
    resolver: zodResolver(EmailCampaignSchema),
    defaultValues: {
      title: campaign?.title || '',
      subject: campaign?.subject || '',
      body: campaign?.body || '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    setValue,
    formState: { isValid },
  } = form;

  useEffect(() => {
    if (campaign) {
      setFormData({
        recipientType: campaign.recipient_type || 'all',
        recipients: campaign.recipients || [],
        recipientFilter: campaign.recipient_filter || null,
      });
    }
  }, [campaign]);

  useEffect(() => {
    const fetchRecipients = async () => {
      if (!debouncedSearchTerm && formData.recipientType !== 'selected') {
        setAvailableRecipients([]);
        return;
      }

      setIsFetchingRecipients(true);
      try {
        const query = supabase
          .from('profiles')
          .select('id, full_name, email')
          .neq('id', session?.user?.id || '');

        let filteredQuery = query;
        
        if (formData.recipientFilter === 'mentee') {
          filteredQuery = query.eq('role', 'mentee');
        } else if (formData.recipientFilter === 'mentor') {
          filteredQuery = query.eq('role', 'mentor');
        }

        if (debouncedSearchTerm) {
          filteredQuery = filteredQuery.ilike('full_name', `%${debouncedSearchTerm}%`);
        }

        const { data, error } = await filteredQuery;

        if (error) {
          console.error('Error fetching recipients:', error);
          toast.error('Failed to fetch recipients. Please try again.');
          return;
        }

        setAvailableRecipients(data || []);
      } finally {
        setIsFetchingRecipients(false);
      }
    };

    fetchRecipients();
  }, [debouncedSearchTerm, formData.recipientFilter, formData.recipientType, session?.user?.id]);

  const onSubmit = async (data: EmailCampaignType) => {
    if (!session?.user) return;

    setIsSaving(true);
    try {
      const campaignData = {
        ...data,
        recipient_type: formData.recipientType,
        recipients: formData.recipients,
        recipient_filter: formData.recipientFilter,
        created_by: session.user.id,
      };

      let response;
      
      if (campaign && 'id' in campaign) {
        response = await supabase
          .from('email_campaigns')
          .update(campaignData)
          .eq('id', campaign.id)
          .select();
      } else {
        response = await supabase
          .from('email_campaigns')
          .insert(campaignData)
          .select();
      }
      
      const { data: savedData, error } = response;

      if (error) {
        console.error('Error saving email campaign:', error);
        toast.error('Failed to save email campaign. Please try again.');
        return;
      }

      toast.success('Email campaign saved successfully!');
      onSuccess?.(savedData?.[0]?.id);
    } catch (error) {
      console.error('Unexpected error saving email campaign:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecipientChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      recipientType: type,
      recipients: [],
    }));
    
    if (type === "selected") {
      setFormData((prev) => ({ ...prev, recipientFilter: null }));
    } else if (type === "mentees") {
      setFormData((prev) => ({ ...prev, recipientFilter: "mentee" }));
    } else if (type === "mentors") {
      setFormData((prev) => ({ ...prev, recipientFilter: "mentor" }));
    } else {
      setFormData((prev) => ({ ...prev, recipientFilter: null }));
    }
  };

  const handleRecipientSelect = (recipient: {id: string}) => {
    setFormData((prev) => ({
      ...prev,
      recipients: [...prev.recipients, recipient.id],
    }));
  };

  const handleRecipientDeselect = (recipientId: string) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((id) => id !== recipientId),
    }));
  };

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  return {
    form,
    formData,
    availableRecipients,
    isFetchingRecipients,
    isSaving,
    handleSubmit,
    onSubmit,
    handleRecipientChange,
    handleRecipientSelect,
    handleRecipientDeselect,
    handleSearchTermChange,
    searchTerm,
    setValue,
    isValid,
  };
};
