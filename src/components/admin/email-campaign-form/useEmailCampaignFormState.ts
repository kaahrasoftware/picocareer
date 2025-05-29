
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ContentSelectOption {
  value: string;
  label: string;
  id: string;
}

interface UseEmailCampaignFormStateReturn {
  availableContent: ContentSelectOption[];
  isLoadingContent: boolean;
  selectedFrequency: string;
  setSelectedFrequency: (frequency: string) => void;
  selectedRecipientType: string;
  setSelectedRecipientType: (type: string) => void;
  selectedContentType: string;
  setSelectedContentType: (type: string) => void;
  selectedContentId: string;
  setSelectedContentId: (id: string) => void;
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
}

export function useEmailCampaignFormState(
  form: UseFormReturn<any>
): UseEmailCampaignFormStateReturn {
  const [selectedFrequency, setSelectedFrequency] = useState<string>('immediate');
  const [selectedRecipientType, setSelectedRecipientType] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('blogs');
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Watch form values
  const watchedContentType = form.watch('content_type');
  const watchedContentId = form.watch('content_id');
  const watchedFrequency = form.watch('frequency');
  const watchedRecipientType = form.watch('recipient_type');

  // Sync local state with form values
  useEffect(() => {
    if (watchedContentType) setSelectedContentType(watchedContentType);
    if (watchedContentId) setSelectedContentId(watchedContentId);
    if (watchedFrequency) setSelectedFrequency(watchedFrequency);
    if (watchedRecipientType) setSelectedRecipientType(watchedRecipientType);
  }, [watchedContentType, watchedContentId, watchedFrequency, watchedRecipientType]);

  // Fetch available content based on content type
  const { data: availableContent = [], isLoading: isLoadingContent } = useQuery({
    queryKey: ['available-content', selectedContentType],
    queryFn: async () => {
      if (!selectedContentType || selectedContentType === '') {
        return [];
      }

      let query;
      
      switch (selectedContentType) {
        case 'blogs':
          query = supabase
            .from('blogs')
            .select('id, title, summary');
          break;
        case 'careers':
          query = supabase
            .from('careers')
            .select('id, title, description');
          break;
        case 'majors':
          query = supabase
            .from('majors')
            .select('id, title, description');
          break;
        case 'scholarships':
          query = supabase
            .from('scholarships')
            .select('id, title, description');
          break;
        case 'opportunities':
          query = supabase
            .from('opportunities')
            .select('id, title, description');
          break;
        case 'schools':
          query = supabase
            .from('schools')
            .select('id, name as title, description');
          break;
        case 'mentors':
          query = supabase
            .from('profiles')
            .select('id, full_name as title, bio as description')
            .eq('user_type', 'mentor');
          break;
        default:
          return [];
      }

      const { data, error } = await query.limit(100);
      
      if (error) {
        console.error('Error fetching content:', error);
        return [];
      }

      return (data || []).map(item => ({
        value: String(item.id),
        label: String(item.title || 'Untitled'),
        id: String(item.id)
      }));
    },
    enabled: !!selectedContentType && selectedContentType !== ''
  });

  return {
    availableContent,
    isLoadingContent,
    selectedFrequency,
    setSelectedFrequency,
    selectedRecipientType,
    setSelectedRecipientType,
    selectedContentType,
    setSelectedContentType,
    selectedContentId,
    setSelectedContentId,
    selectedEventId,
    setSelectedEventId
  };
}
