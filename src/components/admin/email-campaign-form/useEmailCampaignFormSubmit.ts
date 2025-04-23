
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
    const selectedContents = contentList.filter(c => selectedContentIds.includes(c.id));
    
    const campaignInserts = selectedContents.map(content => ({
      scheduled_for: scheduledFor,
      frequency,
      content_type: contentType,
      content_id: content.id,
      subject: `${CONTENT_TYPE_LABELS[contentType]}: ${content.title}`,
      body: `${CONTENT_TYPE_LABELS[contentType]}: ${content.title}\n\nVisit PicoCareer to learn more about this featured ${contentType.slice(0, -1)}.`,
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
    }));

    const { data: insertedCampaigns, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert(campaignInserts)
      .select();

    if (campaignError) throw campaignError;

    if (recipientType === 'selected' && insertedCampaigns) {
      const recipientRecords = insertedCampaigns.flatMap(campaign => 
        selectedRecipients.map(recipientId => ({
          campaign_id: campaign.id,
          profile_id: recipientId
        }))
      );

      const { error: recipientError } = await supabase
        .from('email_campaign_recipients')
        .insert(recipientRecords);

      if (recipientError) throw recipientError;
    }

    toast({ 
      title: "Campaign(s) created!", 
      description: `Scheduled ${campaignInserts.length} campaign(s) for ${new Date(scheduledFor).toLocaleString()}.` 
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
