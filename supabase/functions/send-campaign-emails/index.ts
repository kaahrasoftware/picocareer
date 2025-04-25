
// Main entry point for the send-campaign-emails function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { fetchContentDetails } from "./content-fetcher.ts";
import { processBatchSending } from "./batch-processor.ts";
import { updateCampaignStatus, getRecipients } from "./campaign-manager.ts";
import { Campaign } from "./types.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://picocareer.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = new Resend(RESEND_API_KEY);
    
    let campaignId: string;
    
    try {
      const body = await req.json();
      campaignId = body.campaignId;
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!campaignId) {
      return new Response(
        JSON.stringify({ success: false, error: "Campaign ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();
      
    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ success: false, error: `Campaign not found: ${campaignError?.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    const typedCampaign = campaign as Campaign;
    
    console.log(`Processing campaign: ${typedCampaign.id} - ${typedCampaign.subject}`);
    
    // Update campaign to sending status
    await updateCampaignStatus(
      supabase, 
      typedCampaign.id, 
      "sending", 
      typedCampaign.sent_count, 
      typedCampaign.failed_count,
      typedCampaign.recipients_count || 0
    );
    
    // Get content for the campaign
    let contentIds = typedCampaign.content_ids || [];
    if (typedCampaign.content_id && !contentIds.includes(typedCampaign.content_id)) {
      contentIds = [typedCampaign.content_id, ...contentIds];
    }
    
    // Fetch content details
    const contentList = await fetchContentDetails(
      supabase, 
      typedCampaign.content_type, 
      contentIds
    );
    
    if (contentList.length === 0) {
      await updateCampaignStatus(
        supabase, 
        typedCampaign.id, 
        "failed", 
        0, 
        0, 
        0, 
        "No content found for the specified IDs"
      );
      
      return new Response(
        JSON.stringify({ success: false, error: "No content found for the specified IDs" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Get recipients
    const recipients = await getRecipients(supabase, typedCampaign);
    
    if (recipients.length === 0) {
      await updateCampaignStatus(
        supabase, 
        typedCampaign.id, 
        "failed", 
        0, 
        0, 
        0, 
        "No recipients found"
      );
      
      return new Response(
        JSON.stringify({ success: false, error: "No recipients found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Process sending in batches
    console.log(`Sending to ${recipients.length} recipients in batches`);
    const batchSize = 20;
    const result = await processBatchSending(
      recipients,
      contentList,
      typedCampaign,
      batchSize,
      SITE_URL,
      supabase,
      resend
    );
    
    // Update campaign with results
    const finalStatus = result.failed === 0 ? "sent" : 
                       result.sent === 0 ? "failed" : "partial";
    
    await updateCampaignStatus(
      supabase,
      typedCampaign.id,
      finalStatus,
      result.sent,
      result.failed,
      recipients.length,
      result.errors.length > 0 ? JSON.stringify(result.errors.slice(0, 5)) : undefined
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        campaign: typedCampaign.id,
        sent: result.sent,
        failed: result.failed,
        total: recipients.length,
        status: finalStatus
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Campaign email sending failed:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
