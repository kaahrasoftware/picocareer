
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CONTENT_TYPE_LABELS, ContentType } from "./utils";

type RecipientType = 'all' | 'mentees' | 'mentors' | 'selected';

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
  recipientType: RecipientType;
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

    if (campaignError) throw campaignError;

    if (recipientType === 'selected' && insertedCampaign) {
      const recipientRecords = selectedRecipients.map(recipientId => ({
        campaign_id: insertedCampaign.id,
        profile_id: recipientId
      }));

      const { error: recipientError } = await supabase
        .from('email_campaign_recipients')
        .insert(recipientRecords);

      if (recipientError) throw recipientError;
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
      title: "Error", 
      description: err.message, 
      variant: "destructive" 
    });
  } finally {
    setSubmitting(false);
  }
}
