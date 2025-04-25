
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";
import { fetchContentDetails } from "./content-fetcher.ts";
import { processBatchSending } from "./batch-processor.ts";
import { updateCampaignStatus, getRecipients } from "./campaign-manager.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CampaignEmailRequest {
  campaignId: string;
  batchSize?: number;
  retryCount?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let campaignId: string, batchSize: number, retryCount: number;
    
    try {
      const json = await req.json();
      campaignId = json.campaignId;
      batchSize = json.batchSize ?? 50;
      retryCount = json.retryCount ?? 0;
    } catch (error) {
      console.error("Invalid JSON in request body:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON request body."
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!campaignId) {
      console.error("Missing campaignId in request.");
      return new Response(
        JSON.stringify({ success: false, error: "Campaign ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: campaign, error: campaignError } = await supabaseClient
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError?.message);
      return new Response(
        JSON.stringify({ success: false, error: `Campaign not found: ${campaignError?.message || "Unknown error"}` }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    await supabaseClient
      .from('email_campaigns')
      .update({ 
        status: 'processing', 
        last_checked_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    let recipients = [];
    try {
      recipients = await getRecipients(supabaseClient, campaign);
    } catch (error) {
      console.error("Error fetching recipients:", error);
      await updateCampaignStatus(supabaseClient, campaignId, 'failed', 0, 0, recipients.length, `Error fetching recipients: ${(error as Error).message}`);
      
      return new Response(
        JSON.stringify({ success: false, error: "Error fetching recipients: " + (error as Error).message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (recipients.length === 0) {
      console.warn("No recipients found for this campaign:", campaignId);
      await updateCampaignStatus(supabaseClient, campaignId, 'failed', 0, 0, 0, "No recipients found for this campaign");
      
      return new Response(
        JSON.stringify({ success: false, error: "No recipients found for this campaign" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let contentIds: string[] = [];
    if (campaign.content_ids && Array.isArray(campaign.content_ids) && campaign.content_ids.length > 0) {
      contentIds = campaign.content_ids;
    } else if (campaign.content_type && campaign.content_id) {
      contentIds = [campaign.content_id];
    }

    if (contentIds.length === 0) {
      console.error("No content IDs found in campaign:", campaignId);
      await updateCampaignStatus(supabaseClient, campaignId, 'failed', 0, 0, recipients.length, "No content IDs found in campaign");
      
      return new Response(
        JSON.stringify({ success: false, error: "No content IDs found in campaign" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    let contentList = [];
    try {
      contentList = await fetchContentDetails(supabaseClient, campaign.content_type, contentIds);
      console.log("Fetched content list:", contentList);
    } catch (error) {
      console.error("Error fetching content details:", error);
      await updateCampaignStatus(supabaseClient, campaignId, 'failed', 0, 0, recipients.length, `Error fetching content details: ${(error as Error).message}`);
      
      return new Response(
        JSON.stringify({ success: false, error: "Error fetching content details: " + (error as Error).message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://picocareer.com';
    const startTime = Date.now();
    
    const { sent, failed, errors } = await processBatchSending(
      recipients, 
      contentList,
      campaign,
      batchSize,
      siteUrl,
      supabaseClient,
      resend
    );

    const executionTime = (Date.now() - startTime) / 1000;

    const status = sent > 0 ? (failed > 0 ? 'partial' : 'sent') : 'failed';
    await updateCampaignStatus(supabaseClient, campaignId, status, sent, failed, recipients.length);

    if (sent === 0) {
      console.error("Zero emails sent for campaign:", campaignId, "errors:", errors);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to send emails to any recipients.",
          details: errors
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaignId,
        total_recipients: recipients.length,
        sent,
        failed,
        execution_time_seconds: executionTime,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Unexpected error in send-campaign-emails:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || "Unexpected error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
