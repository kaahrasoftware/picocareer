
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
        value={formState.contentType}
        onChange={(contentType) => updateFormState({ contentType })}
      />

      <ContentSelect
        contentType={formState.contentType}
        selectedIds={formState.contentIds}
        onSelectionChange={(contentIds) => updateFormState({ contentIds })}
      />

      <FrequencySelector
        value={formState.frequency}
        onChange={(frequency) => updateFormState({ frequency })}
      />

      <ScheduleDateTimeInput
        value={formState.scheduledFor}
        onChange={(scheduledFor) => updateFormState({ scheduledFor })}
        frequency={formState.frequency}
      />

      <RecipientTypeSelector
        value={formState.recipientType}
        onChange={(recipientType) => updateFormState({ recipientType })}
      />

      <RecipientSelection
        recipientType={formState.recipientType}
        selectedIds={formState.recipientIds}
        onSelectionChange={(recipientIds) => updateFormState({ recipientIds })}
      />

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
