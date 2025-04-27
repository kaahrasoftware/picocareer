
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    console.log(`Check scheduled campaigns running at: ${now.toISOString()}`);

    // Fetch all campaigns that are scheduled for now or earlier and are in 'pending' status
    const { data: dueCampaigns, error: fetchError } = await supabaseClient
      .from('email_campaigns')
      .select('*')
      .lte('scheduled_for', now.toISOString())
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true });

    if (fetchError) {
      throw new Error(`Error fetching due campaigns: ${fetchError.message}`);
    }

    if (!dueCampaigns || dueCampaigns.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No campaigns due for sending", 
          checked_at: now.toISOString() 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${dueCampaigns.length} campaigns due for sending`);

    const processingResults = [];

    // Process each due campaign
    for (const campaign of dueCampaigns) {
      try {
        console.log(`Processing campaign ${campaign.id} scheduled for ${campaign.scheduled_for}`);

        // Update status to 'sending' to prevent duplicate processing
        const { error: updateError } = await supabaseClient
          .from('email_campaigns')
          .update({ status: 'sending', last_checked_at: now.toISOString() })
          .eq('id', campaign.id);

        if (updateError) {
          console.error(`Error updating campaign status to sending: ${updateError.message}`);
          processingResults.push({
            campaign_id: campaign.id,
            success: false,
            error: `Failed to update status: ${updateError.message}`
          });
          continue;
        }

        // Call the send-campaign-emails function
        const { data: sendResult, error: sendError } = await supabaseClient.functions.invoke('send-campaign-emails', {
          body: { campaignId: campaign.id }
        });

        if (sendError) {
          console.error(`Error sending campaign ${campaign.id}: ${sendError.message}`);
          
          // Update campaign status to 'failed'
          await supabaseClient
            .from('email_campaigns')
            .update({ 
              status: 'failed', 
              error_message: sendError.message,
              last_checked_at: now.toISOString()
            })
            .eq('id', campaign.id);

          processingResults.push({
            campaign_id: campaign.id,
            success: false,
            error: sendError.message
          });
        } else {
          console.log(`Successfully sent campaign ${campaign.id}`);
          processingResults.push({
            campaign_id: campaign.id,
            success: true,
            result: sendResult
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Exception processing campaign ${campaign.id}: ${errorMessage}`);
        
        // Update campaign status to 'failed'
        await supabaseClient
          .from('email_campaigns')
          .update({ 
            status: 'failed', 
            error_message: errorMessage,
            last_checked_at: now.toISOString()
          })
          .eq('id', campaign.id);
          
        processingResults.push({
          campaign_id: campaign.id,
          success: false,
          error: errorMessage
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked_at: now.toISOString(),
        campaigns_processed: dueCampaigns.length,
        results: processingResults
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Top-level error in check-scheduled-campaigns:", errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);
