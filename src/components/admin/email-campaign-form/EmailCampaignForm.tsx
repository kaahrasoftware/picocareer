import React, { useState, useEffect } from 'react';
import { useEmailCampaignFormState } from './useEmailCampaignFormState';
import { ContentTypeSelector } from './ContentTypeSelector';
import { ContentSelect } from './ContentSelect';
import { RecipientTypeSelector } from './RecipientTypeSelector';
import { RecipientSelection } from './RecipientSelection';
import { FrequencySelector } from './FrequencySelector';
import { ScheduleDateTimeInput } from './ScheduleDateTimeInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { EmailPreview } from './EmailPreview';
import { Form } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentType, RecipientType } from './utils';
import { toast } from 'sonner';
import { ContentItem } from '@/types/database/email';
import { useEmailCampaignFormSubmit } from './useEmailCampaignFormSubmit';

interface EmailCampaignFormProps {
  adminId: string;
  onCampaignCreated?: (campaignId: string) => void;
}

const EmailCampaignForm: React.FC<EmailCampaignFormProps> = ({ adminId, onCampaignCreated }) => {
  const [contentType, setContentType] = useState<ContentType>('blogs');
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState<RecipientType>('all');
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduledFor, setScheduledFor] = useState('');
  const [subject, setSubject] = useState('');
  const [randomSelect, setRandomSelect] = useState(false);
  const [randomCount, setRandomCount] = useState(3);

  const { form, isValid, setValue } = useEmailCampaignFormState({
    onSuccess: (campaignId) => {
      if (campaignId) {
        if (onCampaignCreated) {
          onCampaignCreated(campaignId);
        }
        
        // Reset form state
        resetForm();
      }
    }
  });

  const resetForm = () => {
    setSelectedContentIds([]);
    setSubject('');
    setScheduledFor('');
    setRandomSelect(false);
    // Keep other settings like recipient type and frequency as they may be reused
  };

  const { availableRecipients, isFetchingRecipients } = useEmailCampaignFormState();
  
  const { isSubmitting, handleSubmit } = useEmailCampaignFormSubmit({
    adminId,
    formState: {
      subject,
      content_type: contentType,
      content_ids: selectedContentIds,
      recipient_type: recipientType,
      recipient_filter: recipientType === 'selected' 
        ? { profile_ids: recipientIds }
        : recipientType === 'mentees' 
          ? { filter_type: 'mentee' } 
          : recipientType === 'mentors' 
            ? { filter_type: 'mentor' } 
            : null,
      scheduled_for: scheduledFor,
      frequency: frequency
    },
    onSuccess: onCampaignCreated
  });
  
  // Helper function to get content type config for field mapping
  const getContentTypeConfig = (type: ContentType): { 
    tableName: string, 
    titleField: string,
    descriptionField: string,
    imageField: string,
    selectFields: string,
    filters?: Record<string, any>
  } => {
    switch (type) {
      case 'blogs':
        return {
          tableName: "blogs",
          titleField: 'title',
          descriptionField: 'summary',
          imageField: 'cover_image_url',
          selectFields: 'id, title, summary, cover_image_url, created_at, categories'
        };
      case 'careers':
        return {
          tableName: "careers",
          titleField: 'title',
          descriptionField: 'description',
          imageField: 'image_url',
          selectFields: 'id, title, description, image_url, industry, salary_range'
        };
      case 'events':
        return {
          tableName: "events",
          titleField: 'title',
          descriptionField: 'description',
          imageField: 'thumbnail_url',
          selectFields: 'id, title, description, thumbnail_url, event_type, start_time, end_time, organized_by'
        };
      case 'majors':
        return {
          tableName: "majors",
          titleField: 'title',
          descriptionField: 'description',
          imageField: '',
          selectFields: 'id, title, description, potential_salary, category'
        };
      case 'mentors':
        return {
          tableName: "profiles",
          titleField: 'full_name',
          descriptionField: 'bio',
          imageField: 'avatar_url',
          selectFields: 'id, full_name, bio, avatar_url, skills, location',
          filters: { user_type: 'mentor' }
        };
      case 'opportunities':
        return {
          tableName: "opportunities",
          titleField: 'title',
          descriptionField: 'description',
          imageField: 'cover_image_url',
          selectFields: 'id, title, description, cover_image_url, provider_name, deadline, compensation, location, remote'
        };
      case 'scholarships':
        return {
          tableName: "scholarships",
          titleField: 'title',
          descriptionField: 'description',
          imageField: 'image_url',
          selectFields: 'id, title, description, image_url, provider_name, deadline, amount'
        };
      case 'schools':
        return {
          tableName: "schools",
          titleField: 'name',
          descriptionField: '',
          imageField: '',
          selectFields: 'id, name, type, location, country, state, website'
        };
      default:
        return {
          tableName: "blogs",
          titleField: 'title',
          descriptionField: 'summary',
          imageField: 'cover_image_url',
          selectFields: 'id, title, summary, cover_image_url'
        };
    }
  };
  
  // Fetch content based on content type
  const { data: contentList = [], isLoading } = useQuery<ContentItem[]>({
    queryKey: ['content', contentType],
    queryFn: async () => {
      try {
        const config = getContentTypeConfig(contentType);
        console.log(`Fetching content from table: ${config.tableName} with fields: ${config.selectFields}`);
        
        // Build the query with properly typed table name
        // Fix the type error by using a type assertion
        const tableName = config.tableName as any;
        let query = supabase
          .from(tableName)
          .select(config.selectFields);
        
        // Apply any filters if they exist
        if (config.filters) {
          Object.entries(config.filters).forEach(([key, value]) => {
            // @ts-ignore - This is safe as we're building a dynamic query
            query = query.eq(key, value);
          });
        }
        
        // For most tables, sort by created_at
        if (config.tableName !== 'schools' && config.tableName !== 'profiles') {
          query = query.order('created_at', { ascending: false });
        }
        
        // Limit to 50 results
        query = query.limit(50);
        
        const { data, error } = await query;
        
        if (error) {
          console.error(`Error fetching ${contentType}:`, error);
          return [] as ContentItem[];
        }
        
        // Transform data to standardize format for all content types
        const transformedData = data.map((item: any) => {
          return {
            id: item.id,
            title: item[config.titleField] || `Untitled ${contentType}`,
            description: item[config.descriptionField] || '',
            cover_image_url: item[config.imageField] || '',
            ...item  // Keep all original properties
          };
        });
        
        console.log(`Fetched ${transformedData.length} ${contentType} items`);
        return transformedData as ContentItem[];
      } catch (error) {
        console.error(`Error in content fetching:`, error);
        toast.error(`Failed to fetch ${contentType}. Please try again.`);
        return [] as ContentItem[];
      }
    }
  });

  // Apply random selection if enabled
  useEffect(() => {
    if (randomSelect && contentList && contentList.length > 0 && randomCount > 0) {
      // Shuffle array and pick the first N items
      const shuffled = [...contentList].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(randomCount, contentList.length));
      setSelectedContentIds(selected.map(item => item.id));
    }
  }, [randomSelect, randomCount, contentList]);

  // Reset selected content when content type changes
  useEffect(() => {
    setSelectedContentIds([]);
  }, [contentType]);

  const handleFormSubmit = async () => {
    // Verify admin status before submission
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', adminId)
        .single();
        
      if (profileError) {
        console.error("Error verifying admin status:", profileError);
        toast.error("Could not verify admin privileges");
        return;
      }
      
      if (profile.user_type !== 'admin') {
        toast.error("You must be an admin to create campaigns");
        return;
      }
      
      console.log("Admin status verified:", profile.user_type);
      
      if (!subject) {
        toast.error('Please enter a subject');
        return;
      }
      
      if (selectedContentIds.length === 0) {
        toast.error('Please select at least one content item');
        return;
      }
      
      if (recipientType === 'selected' && recipientIds.length === 0) {
        toast.error('Please select at least one recipient');
        return;
      }
      
      if (!scheduledFor) {
        toast.error('Please select a scheduled date and time');
        return;
      }
      
      // Set form values for submission
      setValue('subject', subject);
      setValue('content_type', contentType);
      setValue('content_ids', selectedContentIds);
      
      // Create a properly formatted recipient_filter based on selection
      if (recipientType === 'selected') {
        setValue('recipient_filter', { profile_ids: recipientIds });
      } else if (recipientType === 'mentees') {
        setValue('recipient_filter', { filter_type: 'mentee' });
      } else if (recipientType === 'mentors') {
        setValue('recipient_filter', { filter_type: 'mentor' });
      } else {
        setValue('recipient_filter', null);
      }
      
      setValue('recipient_type', recipientType);
      setValue('scheduled_for', scheduledFor);
      setValue('frequency', frequency);
      
      console.log("Submitting form with data:", {
        subject,
        content_type: contentType,
        content_ids: selectedContentIds,
        recipient_type: recipientType,
        recipient_filter: recipientType === 'selected' ? { profile_ids: recipientIds } : null,
        scheduled_for: scheduledFor,
        frequency: frequency,
        adminId
      });
      
      // Execute the submit handler
      await handleSubmit();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const hasRequiredFields = subject && 
    (selectedContentIds.length > 0 || randomSelect) && 
    (recipientType !== 'selected' || (recipientType === 'selected' && recipientIds.length > 0)) &&
    scheduledFor;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div>
          <Label htmlFor="subject" className="text-base">Campaign Subject</Label>
          <Input
            id="subject"
            placeholder="Enter email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1"
          />
        </div>

        <ContentTypeSelector
          contentType={contentType}
          setContentType={setContentType}
        />

        <ContentSelect
          contentType={contentType}
          contentList={(contentList || []) as any[]}
          selectedContentIds={selectedContentIds}
          setSelectedContentIds={setSelectedContentIds}
          loadingContent={isLoading}
          randomSelect={randomSelect}
          setRandomSelect={setRandomSelect}
          randomCount={randomCount}
          setRandomCount={setRandomCount}
        />

        <FrequencySelector
          frequency={frequency}
          setFrequency={setFrequency}
        />

        <ScheduleDateTimeInput
          scheduledFor={scheduledFor}
          setScheduledFor={setScheduledFor}
        />

        <RecipientTypeSelector
          recipientType={recipientType}
          setRecipientType={(type) => {
            setRecipientType(type as RecipientType);
          }}
        />

        {recipientType === 'selected' && (
          <RecipientSelection
            recipientsList={availableRecipients}
            selectedRecipients={recipientIds}
            setSelectedRecipients={setRecipientIds}
          />
        )}

        {selectedContentIds.length > 0 && contentList.length > 0 && (
          <div className="mt-8">
            <EmailPreview 
              selectedContentIds={selectedContentIds}
              contentList={contentList as ContentItem[]}
              contentType={contentType}
            />
          </div>
        )}

        <Button
          onClick={handleFormSubmit}
          disabled={isSubmitting || !hasRequiredFields || isLoading}
          className="w-full mt-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Campaign...
            </>
          ) : (
            'Create Campaign'
          )}
        </Button>
      </Form>
    </div>
  );
};

export default EmailCampaignForm;
