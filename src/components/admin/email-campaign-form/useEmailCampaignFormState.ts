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
  specificRecipientType?: RecipientType;
}

export const useEmailCampaignFormState = ({ campaign, onSuccess, specificRecipientType }: UseEmailCampaignFormStateProps = {}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    recipientType: 'all' as RecipientType,
    recipientIds: [] as string[],
    recipientFilter: null as Record<string, any> | null,
    selectedEventId: '',
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
      // Extract profile IDs from campaign's recipient_filter if it exists
      const profileIds = 
        campaign.recipient_filter && 
        typeof campaign.recipient_filter === 'object' && 
        campaign.recipient_filter.profile_ids && 
        Array.isArray(campaign.recipient_filter.profile_ids) 
          ? campaign.recipient_filter.profile_ids 
          : [];
      
      setFormData({
        recipientType: (campaign.recipient_type as RecipientType) || 'all',
        recipientIds: profileIds,
        recipientFilter: campaign.recipient_filter || null,
        selectedEventId: campaign.recipient_filter?.event_id || '',
      });
    }
  }, [campaign]);

  // Override recipientType when specificRecipientType is provided
  useEffect(() => {
    if (specificRecipientType) {
      setFormData(prev => ({
        ...prev,
        recipientType: specificRecipientType
      }));
    }
  }, [specificRecipientType]);
  
  // Fetch event registrants when needed
  const fetchEventRegistrants = useCallback(async (eventId: string) => {
    if (!eventId) return [];
    
    setIsFetchingRecipients(true);
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('profile_id, profiles:profile_id(id, full_name, email)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching event registrants:', error);
        toast.error('Failed to fetch event registrants');
        return [];
      }
      
      // Transform data to match recipient format
      const registrants = data.map(reg => ({
        id: reg.profiles.id,
        full_name: reg.profiles.full_name,
        email: reg.profiles.email
      }));
      
      // Sort alphabetically by name
      registrants.sort((a, b) => {
        const nameA = a.full_name || a.email || '';
        const nameB = b.full_name || b.email || '';
        return nameA.localeCompare(nameB);
      });
      
      return registrants;
    } catch (error) {
      console.error('Error in event registrant fetching:', error);
      return [];
    } finally {
      setIsFetchingRecipients(false);
    }
  }, []);

  // Fetch recipients based on search term and filters
  const fetchRecipients = useCallback(async () => {
    const currentRecipientType = specificRecipientType || formData.recipientType;
    
    // Special handling for event registrants
    if (currentRecipientType === 'event_registrants') {
      if (formData.selectedEventId) {
        const registrants = await fetchEventRegistrants(formData.selectedEventId);
        setAvailableRecipients(registrants);
      }
      return;
    }
    
    // For normal recipients (users), always fetch when type is 'selected'
    if (currentRecipientType !== 'selected') {
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
      
      // Always sort alphabetically by name
      filteredQuery = filteredQuery.order('full_name', { ascending: true });

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
  }, [debouncedSearchTerm, formData.recipientFilter, formData.recipientType, formData.selectedEventId, session?.user?.id, specificRecipientType, fetchEventRegistrants]);

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
        ? { profile_ids: formData.recipientIds } // Changed from recipient_ids to profile_ids
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

      // Refresh the session before making the database request
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session refresh error:', sessionError);
        toast.error(`Authentication error: ${sessionError.message}`);
        return;
      }

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
        profile_ids: [...(prev.recipientIds || []), recipient.id] // Changed from recipient_ids to profile_ids
      }
    }));
  };

  const handleRecipientDeselect = (recipientId: string) => {
    setFormData((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.filter((id) => id !== recipientId),
      recipientFilter: {
        ...prev.recipientFilter,
        profile_ids: prev.recipientIds.filter((id) => id !== recipientId) // Changed from recipient_ids to profile_ids
      }
    }));
  };

  const handleEventSelect = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEventId: eventId,
      recipientFilter: {
        ...prev.recipientFilter,
        event_id: eventId
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
    handleEventSelect,
    handleSearchTermChange,
    searchTerm,
    setValue,
    isValid,
  };
};
