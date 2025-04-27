import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CONTENT_TYPE_LABELS, ContentType } from "./utils";

type FormState = {
  subject: string;
  contentType: ContentType;
  contentIds: string[];
  frequency: "once" | "daily" | "weekly" | "monthly";
  scheduledFor: string;
  recipientType: 'all' | 'mentees' | 'mentors' | 'selected';
  recipientIds: string[];
};

interface UseEmailCampaignFormSubmitProps {
  adminId: string;
  formState: FormState;
  onSuccess?: (campaignId: string) => void;
}

export const useEmailCampaignFormSubmit = ({
  adminId,
  formState,
  onSuccess
}: UseEmailCampaignFormSubmitProps) => {
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formState.contentType || !formState.frequency || !formState.scheduledFor || formState.contentIds.length === 0) {
      toast({ title: "Fill all required fields", variant: "destructive" });
      return;
    }

    // Validate that scheduled time is in the future
    const scheduleDate = new Date(formState.scheduledFor);
    if (scheduleDate <= new Date()) {
      toast({
        title: "Invalid schedule time",
        description: "Scheduled time must be in the future",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create a campaign with all content IDs
      const campaignInsert = {
        scheduled_for: formState.scheduledFor,
        frequency: formState.frequency,
        content_type: formState.contentType,
        content_ids: formState.contentIds,
        content_id: formState.contentIds[0], // Keep first ID for backward compatibility
        subject: formState.subject || `${CONTENT_TYPE_LABELS[formState.contentType]}: ${formState.contentIds.length} items`,
        body: `Check out these featured ${formState.contentType}!`,
        admin_id: adminId,
        recipient_type: formState.recipientType,
        recipient_filter: formState.recipientType === 'selected' 
          ? { profile_ids: formState.recipientIds } 
          : {},
        sent_at: null,
        failed_count: 0,
        recipients_count: 0,
        status: 'pending',
        last_error: null,
        last_checked_at: null
      };

      const { data: insertedCampaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert(campaignInsert)
        .select()
        .single();

      if (campaignError || !insertedCampaign) {
        throw new Error(
          `Failed to insert campaign: ${campaignError?.message || 'Unknown error'}`
        );
      }

      if (formState.recipientType === 'selected' && insertedCampaign) {
        const recipientRecords = formState.recipientIds.map(recipientId => ({
          campaign_id: insertedCampaign.id,
          profile_id: recipientId
        }));

        const { error: recipientError } = await supabase
          .from('email_campaign_recipients')
          .insert(recipientRecords);

        if (recipientError) {
          throw new Error(`Failed to insert recipients: ${recipientError.message}`);
        }
      }

      toast({
        title: "Campaign created!",
        description: `Scheduled campaign with ${formState.contentIds.length} items for ${new Date(formState.scheduledFor).toLocaleString()}.`
      });

      if (onSuccess) {
        onSuccess(insertedCampaign.id);
      }
      
      return insertedCampaign.id;
    } catch (err: any) {
      toast({
        title: "Error sending campaign",
        description: err?.message || "Unknown error — please check that all fields and recipients are correct.",
        variant: "destructive"
      });
      if (typeof window !== 'undefined') {
        console.error("Error sending campaign:", err);
      }
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
};

export async function handleEmailCampaignFormSubmit({
  e, adminId, contentList, selectedContentIds, frequency, scheduledFor, contentType, recipientType, selectedRecipients, onCampaignCreated, setSubmitting, setSelectedContentIds, setSelectedRecipients
}: {
  e: React.FormEvent;
  adminId: string;
  contentList: { id: string; title: string }[];
  selectedContentIds: string[];
  frequency: "daily" | "weekly" | "monthly";
  scheduledFor: string;
  contentType: ContentType;
  recipientType: 'all' | 'mentees' | 'mentors' | 'selected';
  selectedRecipients: string[];
  onCampaignCreated?: () => void;
  setSubmitting: (b: boolean) => void;
  setSelectedContentIds: (ids: string[]) => void;
  setSelectedRecipients: (ids: string[]) => void;
}) {
  e.preventDefault();
  if (!contentType || !frequency || !scheduledFor || selectedContentIds.length === 0) {
    toast({ title: "Fill all required fields", variant: "destructive" });
    return;
  }

  // Validate that scheduled time is in the future
  const scheduleDate = new Date(scheduledFor);
  if (scheduleDate <= new Date()) {
    toast({ 
      title: "Invalid schedule time", 
      description: "Scheduled time must be in the future",
      variant: "destructive" 
    });
    return;
  }

  setSubmitting(true);
  try {
    // For multiple content IDs, we'll create a single campaign with all content IDs
    const selectedContents = contentList.filter(c => selectedContentIds.includes(c.id));
    const contentTitles = selectedContents.map(c => c.title).join(", ");
    
    // Create a single campaign with all content IDs
    const campaignInsert = {
      scheduled_for: scheduledFor,
      frequency,
      content_type: contentType,
      content_ids: selectedContentIds, // Store all content IDs
      content_id: selectedContentIds[0], // Keep first ID for backward compatibility
      subject: `${CONTENT_TYPE_LABELS[contentType]}: ${selectedContents.length > 1 ? `${selectedContents.length} Items` : contentTitles}`,
      body: `Check out these featured ${contentType}!`,
      admin_id: adminId,
      recipient_type: recipientType,
      recipient_filter: recipientType === 'selected' 
        ? { profile_ids: selectedRecipients } 
        : {},
      sent_at: null,
      failed_count: 0,
      recipients_count: 0,
      status: 'pending',
      last_error: null,
      last_checked_at: null
    };

    const { data: insertedCampaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert(campaignInsert)
      .select()
      .single();

    if (campaignError || !insertedCampaign) {
      throw new Error(
        `Failed to insert campaign: ${campaignError?.message || 'Unknown error'}`
      );
    }

    if (recipientType === 'selected' && insertedCampaign) {
      const recipientRecords = selectedRecipients.map(recipientId => ({
        campaign_id: insertedCampaign.id,
        profile_id: recipientId
      }));

      const { error: recipientError } = await supabase
        .from('email_campaign_recipients')
        .insert(recipientRecords);

      if (recipientError) {
        throw new Error(`Failed to insert recipients: ${recipientError.message}`);
      }
    }

    toast({ 
      title: "Campaign created!", 
      description: `Scheduled campaign with ${selectedContentIds.length} items for ${new Date(scheduledFor).toLocaleString()}.` 
    });
    
    setSelectedContentIds([]);
    setSelectedRecipients([]);
    
    if (onCampaignCreated) {
      onCampaignCreated();
    }
  } catch (err: any) {
    toast({ 
      title: "Error sending campaign", 
      description: err?.message || "Unknown error — please check that all fields and recipients are correct.",
      variant: "destructive" 
    });
    // Optional: log error for debugging in future
    if (typeof window !== 'undefined') {
      console.error("Error sending campaign:", err);
    }
  } finally {
    setSubmitting(false);
  }
}
