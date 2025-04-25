
import React from 'react';
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

interface EmailCampaignFormProps {
  adminId: string;
  onCampaignCreated?: (campaignId: string) => void;
}

const EmailCampaignForm: React.FC<EmailCampaignFormProps> = ({ adminId, onCampaignCreated }) => {
  const {
    formState,
    contentList,
    updateFormState,
    isLoading,
    hasRequiredFields,
    recipientsList
  } = useEmailCampaignFormState({ adminId });

  const { isSubmitting, handleSubmit } = useEmailCampaignFormSubmit({
    adminId,
    formState,
    onSuccess: (campaignId) => {
      onCampaignCreated?.(campaignId);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="subject" className="text-base">Campaign Subject</Label>
        <Input
          id="subject"
          placeholder="Enter email subject"
          value={formState.subject}
          onChange={(e) => updateFormState({ subject: e.target.value })}
          className="mt-1"
        />
      </div>

      <ContentTypeSelector
        contentType={formState.contentType}
        setContentType={(contentType) => updateFormState({ contentType })}
      />

      <ContentSelect
        contentType={formState.contentType}
        contentList={contentList}
        selectedContentIds={formState.contentIds}
        setSelectedContentIds={(contentIds) => updateFormState({ contentIds })}
        loadingContent={isLoading}
        randomSelect={false}
        setRandomSelect={() => {}}
        randomCount={3}
        setRandomCount={() => {}}
      />

      <FrequencySelector
        frequency={formState.frequency}
        setFrequency={(frequency) => updateFormState({ frequency })}
      />

      <ScheduleDateTimeInput
        scheduledFor={formState.scheduledFor}
        setScheduledFor={(scheduledFor) => updateFormState({ scheduledFor })}
      />

      <RecipientTypeSelector
        recipientType={formState.recipientType}
        setRecipientType={(recipientType) => updateFormState({ recipientType })}
      />

      {formState.recipientType === 'selected' && (
        <RecipientSelection
          recipientsList={recipientsList}
          selectedRecipients={formState.recipientIds}
          setSelectedRecipients={(recipientIds) => updateFormState({ recipientIds })}
        />
      )}

      {formState.contentIds.length > 0 && (
        <div className="mt-8">
          <EmailPreview 
            selectedContentIds={formState.contentIds}
            contentList={contentList}
            contentType={formState.contentType}
          />
        </div>
      )}

      <Button
        onClick={() => handleSubmit()}
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
    </div>
  );
};

export default EmailCampaignForm;
