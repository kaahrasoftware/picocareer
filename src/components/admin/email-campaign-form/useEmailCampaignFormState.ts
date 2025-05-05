
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuthSession } from '@/hooks/useAuthSession';
import { supabase } from '@/integrations/supabase/client';
import { EmailCampaignSchema, EmailCampaignType } from './emailCampaign.schema';
import { useDebounce } from '@/hooks/useDebounce';
import { RecipientType } from './utils';

interface UseEmailCampaignFormStateProps {
  campaign?: EmailCampaignType | null;
  onSuccess?: (campaignId?: string) => void;
}

export const useEmailCampaignFormState = ({ campaign, onSuccess }: UseEmailCampaignFormStateProps = {}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    recipientType: 'all' as RecipientType,
    recipientIds: [] as string[],
    recipientFilter: null as Record<string, any> | null,
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

  // Handle when campaign props change
  useEffect(() => {
    if (campaign) {
      // Extract recipient IDs from campaign's recipient_filter if it exists
      const recipientIds = 
        campaign.recipient_filter && 
        typeof campaign.recipient_filter === 'object' && 
        Array.isArray(campaign.recipient_filter.recipient_ids) 
          ? campaign.recipient_filter.recipient_ids 
          : [];
      
      setFormData({
        recipientType: (campaign.recipient_type as RecipientType) || 'all',
        recipientIds,
        recipientFilter: campaign.recipient_filter || null,
      });
    }
  }, [campaign]);

  // Fetch recipients based on search term and filters
  const fetchRecipients = useCallback(async () => {
    if (!debouncedSearchTerm && formData.recipientType !== 'selected') {
      setAvailableRecipients([]);
      return;
    }

    setIsFetchingRecipients(true);
    try {
      const query = supabase
        .from('profiles')
        .select('id, full_name, email');
      
      // Don't include the current user
      if (session?.user?.id) {
        query.neq('id', session.user.id);
      }

      let filteredQuery = query;
      
      // Apply role filter if needed
      if (formData.recipientFilter && formData.recipientFilter.filter_type === 'mentee') {
        filteredQuery = query.eq('user_type', 'mentee');
      } else if (formData.recipientFilter && formData.recipientFilter.filter_type === 'mentor') {
        filteredQuery = query.eq('user_type', 'mentor');
      }

      // Apply search term filter if provided
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
  }, [debouncedSearchTerm, formData.recipientFilter, formData.recipientType, session?.user?.id]);

  // Run the fetch when dependencies change
  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  const onSubmit = async (data: EmailCampaignType) => {
    if (!session?.user) return;

    setIsSaving(true);
    try {
      console.log("Form submission data:", data);
      
      // Ensure we have a primary content_id from the first content_ids item
      const primaryContentId = data.content_ids && data.content_ids.length > 0 
        ? data.content_ids[0] 
        : null;
        
      if (!primaryContentId) {
        toast.error('At least one content item must be selected');
        setIsSaving(false);
        return;
      }
      
      // Calculate recipients count based on type
      const recipientsCount = formData.recipientType === 'selected' 
        ? formData.recipientIds.length 
        : await getEstimatedRecipientsCount(formData.recipientType, formData.recipientFilter?.filter_type || null);
      
      // Create a properly structured recipient_filter
      const recipientFilter = formData.recipientType === 'selected'
        ? { recipient_ids: formData.recipientIds }
        : formData.recipientFilter;
      
      const campaignData = {
        admin_id: session.user.id,
        subject: data.subject,
        body: data.body || '',
        content_type: data.content_type || 'blogs',
        content_id: primaryContentId, // Required field - set from first content ID
        content_ids: data.content_ids || [],
        recipient_type: formData.recipientType,
        recipient_filter: recipientFilter,
        scheduled_for: data.scheduled_for,
        frequency: data.frequency || 'weekly',
        status: 'planned', // Use 'planned' instead of 'scheduled'
        sent_count: 0, // Explicitly set to 0
        failed_count: 0, // Explicitly set to 0
        recipients_count: recipientsCount
      };

      console.log("Submitting campaign data:", campaignData);

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
        toast.error(`Failed to save email campaign: ${error.message}`);
        return;
      }

      toast.success('Email campaign saved successfully!');
      // Cast the unknown value to string for typesafety
      const campaignId = savedData?.[0]?.id as string | undefined;
      onSuccess?.(campaignId);
    } catch (error) {
      console.error('Unexpected error saving email campaign:', error);
      toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to estimate recipient count
  const getEstimatedRecipientsCount = async (type: string, filter: string | null): Promise<number> => {
    try {
      let query = supabase.from('profiles').select('id', { count: 'exact' });
      
      if (type === 'mentees') {
        query = query.eq('user_type', 'mentee');
      } else if (type === 'mentors') {
        query = query.eq('user_type', 'mentor');
      }
      
      const { count, error } = await query;
      
      if (error) {
        console.error('Error getting recipient count:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error estimating recipients:', error);
      return 0;
    }
  };

  const handleRecipientChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      recipientType: type as RecipientType,
      recipientIds: [],
    }));
    
    let newFilter = null;
    if (type === "mentees") {
      newFilter = { filter_type: "mentee" };
    } else if (type === "mentors") {
      newFilter = { filter_type: "mentor" };
    }
    
    setFormData((prev) => ({ ...prev, recipientFilter: newFilter }));
  };

  const handleRecipientSelect = (recipient: {id: string}) => {
    setFormData((prev) => ({
      ...prev,
      recipientIds: [...prev.recipientIds, recipient.id],
      recipientFilter: {
        ...prev.recipientFilter,
        recipient_ids: [...(prev.recipientIds || []), recipient.id]
      }
    }));
  };

  const handleRecipientDeselect = (recipientId: string) => {
    setFormData((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.filter((id) => id !== recipientId),
      recipientFilter: {
        ...prev.recipientFilter,
        recipient_ids: prev.recipientIds.filter((id) => id !== recipientId)
      }
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
