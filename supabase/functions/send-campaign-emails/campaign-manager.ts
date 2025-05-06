import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { ContentItem } from "./types.ts";

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
  // Handle specifically selected profiles
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
  
  // Handle event registrants
  if (campaign.recipient_type === 'event_registrants' && campaign.recipient_filter?.event_id) {
    console.log(`Fetching registrants for event: ${campaign.recipient_filter.event_id}`);
    
    const { data: eventRegistrants, error: registrantsError } = await supabase
      .from('event_registrations')
      .select('id, email, first_name, last_name, profile_id')
      .eq('event_id', campaign.recipient_filter.event_id);
      
    if (registrantsError) {
      throw new Error(`Error fetching event registrants: ${registrantsError.message}`);
    }
    
    // Format registrants to match the expected output format
    // If profile_id exists, we'll prioritize it and get full_name from profiles,
    // otherwise use the registration data directly
    const registrantsWithProfiles = await Promise.all((eventRegistrants || []).map(async (reg: any) => {
      if (reg.profile_id) {
        // Try to get profile data for this registrant
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', reg.profile_id)
          .single();
          
        if (!profileError && profile) {
          return profile;
        }
      }
      
      // Fall back to registration data if profile not found or profile_id not available
      return {
        id: reg.profile_id || reg.id, // Use profile_id if available, otherwise registration id
        email: reg.email,
        full_name: [reg.first_name, reg.last_name].filter(Boolean).join(' ')
      };
    }));
    
    console.log(`Found ${registrantsWithProfiles.length} registrants for event ${campaign.recipient_filter.event_id}`);
    return registrantsWithProfiles;
  }

  // Build the query for user-type filters
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
