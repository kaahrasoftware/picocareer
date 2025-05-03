
import React, { useState } from 'react';
import { useEmailCampaignFormState } from './useEmailCampaignFormState';
import { useEmailCampaignFormSubmit } from './useEmailCampaignFormSubmit';
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
import { ContentType } from './utils';

interface EmailCampaignFormProps {
  adminId: string;
  onCampaignCreated?: (campaignId: string) => void;
}

const EmailCampaignForm: React.FC<EmailCampaignFormProps> = ({ adminId, onCampaignCreated }) => {
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState('all');
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduledFor, setScheduledFor] = useState('');
  const [subject, setSubject] = useState('');
  const [randomSelect, setRandomSelect] = useState(false);
  const [randomCount, setRandomCount] = useState(3);

  const {
    form,
    formData,
    availableRecipients,
    isFetchingRecipients,
    isSaving,
    handleSubmit,
    onSubmit,
    handleRecipientChange,
    handleSearchTermChange,
    searchTerm,
    setValue,
    isValid
  } = useEmailCampaignFormState({
    onSuccess: (campaignId) => {
      onCampaignCreated?.(campaignId);
    }
  });

  // Fetch content based on content type
  const { data: contentList = [], isLoading } = useQuery({
    queryKey: ['content', contentType],
    queryFn: async () => {
      let tableName = '';
      
      switch(contentType) {
        case 'blog':
          tableName = 'blog_posts';
          break;
        case 'event':
          tableName = 'events';
          break;
        case 'news':
          tableName = 'news_articles';
          break;
        case 'update':
          tableName = 'updates';
          break;
        case 'promotion':
          tableName = 'promotions';
          break;
        default:
          tableName = 'blog_posts';
      }
      
      const { data, error } = await supabase
        .from(tableName)
        .select('id, title')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error(`Error fetching ${contentType}:`, error);
        return [];
      }
      
      return data || [];
    }
  });

  const handleFormSubmit = () => {
    setValue('subject', subject);
    setValue('content_type', contentType);
    setValue('content_ids', selectedContentIds);
    setValue('recipient_type', recipientType);
    setValue('recipients', recipientIds);
    setValue('scheduled_for', scheduledFor);
    setValue('frequency', frequency);
    
    handleSubmit(onSubmit)();
  };

  const hasRequiredFields = subject && 
    (selectedContentIds.length > 0 || randomSelect) && 
    (recipientType !== 'selected' || (recipientType === 'selected' && recipientIds.length > 0));

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
          contentList={contentList}
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
            setRecipientType(type);
            handleRecipientChange(type);
          }}
        />

        {recipientType === 'selected' && (
          <RecipientSelection
            recipientsList={availableRecipients}
            selectedRecipients={recipientIds}
            setSelectedRecipients={setRecipientIds}
          />
        )}

        {selectedContentIds.length > 0 && (
          <div className="mt-8">
            <EmailPreview 
              selectedContentIds={selectedContentIds}
              contentList={contentList}
              contentType={contentType}
            />
          </div>
        )}

        <Button
          onClick={handleFormSubmit}
          disabled={isSaving || !hasRequiredFields || isLoading}
          className="w-full mt-6"
        >
          {isSaving ? (
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
