
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { ContentItem } from "./types";

export async function updateCampaignStatus(
  supabase: any,
  campaignId: string,
  status: string,
  sentCount: number,
  failedCount: number,
  recipientsCount: number,
  lastError?: string
): Promise<void> {
  try {
    const updateData: any = {
      status,
      sent_at: status !== 'failed' ? new Date().toISOString() : null,
      recipients_count: recipientsCount,
      sent_count: sentCount,
      failed_count: failedCount
    };
    
    if (lastError) {
      updateData.last_error = lastError;
    }
    
    const { error } = await supabase
      .from('email_campaigns')
      .update(updateData)
      .eq('id', campaignId);
      
    if (error) {
      console.error("Failed to update campaign status:", error.message);
    }
  } catch (error) {
    console.error("Error updating campaign status:", error);
  }
}

export async function getRecipients(
  supabase: any,
  campaign: any
): Promise<{ id: string; email: string; full_name?: string }[]> {
  if (campaign.recipient_type === 'selected' && campaign.recipient_filter?.profile_ids) {
    const { data: selectedRecipients, error: recipientsError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', campaign.recipient_filter.profile_ids);
      
    if (recipientsError) {
      throw new Error(`Error fetching selected recipients: ${recipientsError.message}`);
    }
    return selectedRecipients || [];
  }

  let query = supabase
    .from('profiles')
    .select('id, email, full_name');
    
  if (campaign.recipient_type === 'mentees') {
    query = query.eq('user_type', 'mentee');
  } else if (campaign.recipient_type === 'mentors') {
    query = query.eq('user_type', 'mentor');
  }
  
  const { data: queriedRecipients, error: recipientsError } = await query;
  
  if (recipientsError) {
    throw new Error(`Error fetching recipients: ${recipientsError.message}`);
  }
  return queriedRecipients || [];
}
