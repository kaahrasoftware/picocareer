
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
import { ContentType } from './utils';

interface EmailCampaignFormProps {
  adminId: string;
  onCampaignCreated?: (campaignId: string) => void;
}

const EmailCampaignForm: React.FC<EmailCampaignFormProps> = ({ adminId, onCampaignCreated }) => {
  const [subject, setSubject] = useState('');
  const [contentType, setContentType] = useState<ContentType>('scholarships');
  const [contentIds, setContentIds] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">('daily');
  const [scheduledFor, setScheduledFor] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'mentees' | 'mentors' | 'selected'>('all');
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [randomSelect, setRandomSelect] = useState(false);
  const [randomCount, setRandomCount] = useState(3);
  
  const { 
    contentList, 
    recipients, 
    isLoading, 
    isScheduling,
    handleRecipientTypeChange,
    handleContentSelectionChange,
    handleSelectedRecipientsChange,
    scheduleCampaign,
    loadRecipients
  } = useEmailCampaignFormState(adminId, contentType, () => {
    if (onCampaignCreated) {
      onCampaignCreated("success");
    }
  });

  // Effect to load recipients when recipient type changes
  useEffect(() => {
    handleRecipientTypeChange(recipientType);
    loadRecipients();
  }, [recipientType, handleRecipientTypeChange, loadRecipients]);

  const handleSubmit = async () => {
    try {
      console.log("Form submission started with values:", {
        subject,
        contentType,
        contentIds,
        recipientType,
        recipientIds,
        scheduledFor,
        frequency
      });

      const formValues = {
        subject,
        content_type: contentType,
        recipient_type: recipientType,
        recipient_ids: recipientIds,
        content_ids: contentIds,
        scheduled_for: scheduledFor ? new Date(scheduledFor) : null,
        frequency
      };
      
      const result = await scheduleCampaign(formValues);
      if (onCampaignCreated && result) {
        onCampaignCreated(result.id);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      // Toast is already handled in scheduleCampaign
    }
  };

  const hasRequiredFields = subject.trim() !== '' && 
    contentIds.length > 0 && 
    scheduledFor !== '' && 
    (recipientType !== 'selected' || recipientIds.length > 0);

  return (
    <div className="space-y-6">
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

      {isLoading ? (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading content...</span>
        </div>
      ) : (
        <ContentSelect
          contentType={contentType}
          contentList={contentList || []}
          selectedContentIds={contentIds}
          setSelectedContentIds={setContentIds}
          loadingContent={isLoading}
          randomSelect={randomSelect}
          setRandomSelect={setRandomSelect}
          randomCount={randomCount}
          setRandomCount={setRandomCount}
        />
      )}

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
        setRecipientType={setRecipientType}
      />

      {recipientType === 'selected' && (
        <RecipientSelection
          recipientsList={recipients}
          selectedRecipients={recipientIds}
          setSelectedRecipients={setRecipientIds}
        />
      )}

      {contentIds.length > 0 && (
        <div className="mt-8">
          <EmailPreview 
            selectedContentIds={contentIds}
            contentList={contentList || []}
            contentType={contentType}
          />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isScheduling || !hasRequiredFields || isLoading}
        className="w-full mt-6"
      >
        {isScheduling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Campaign...
          </>
        ) : (
          'Create Campaign'
        )}
      </Button>
    </div>
  );
};

export default EmailCampaignForm;
