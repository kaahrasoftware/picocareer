import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { google } from "npm:googleapis@126.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CampaignEmailRequest {
  campaignId: string;
  batchSize?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let campaignId, batchSize;
    try {
      const json = await req.json();
      campaignId = json.campaignId;
      batchSize = json.batchSize ?? 50;
    } catch (error) {
      console.error("Failed to parse request JSON", error);
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
      const message = "Campaign ID is required";
      console.error(message);
      return new Response(
        JSON.stringify({ success: false, error: message }),
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

    let campaign;
    let campaignError;
    try {
      const { data, error } = await supabaseClient
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      campaign = data;
      campaignError = error;
    } catch (err) {
      campaignError = err instanceof Error ? err : { message: String(err) };
    }

    if (campaignError || !campaign) {
      const message = `Campaign not found: ${campaignError?.message || "Unknown error"}`;
      console.error(message);
      return new Response(
        JSON.stringify({ success: false, error: message }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    let recipients: { id: string; email: string; full_name?: string }[] = [];
    try {
      if (campaign.recipient_type === 'selected' && campaign.recipient_filter?.profile_ids) {
        const { data: selectedRecipients, error: recipientsError } = await supabaseClient
          .from('profiles')
          .select('id, email, full_name')
          .in('id', campaign.recipient_filter.profile_ids);
        if (recipientsError) {
          throw new Error(`Error fetching selected recipients: ${recipientsError.message}`);
        }
        recipients = selectedRecipients || [];
      } else {
        let query = supabaseClient
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
        recipients = queriedRecipients || [];
      }
    } catch (error) {
      const msg = (error as Error).message || error;
      console.error("Error fetching recipients:", msg);
      return new Response(
        JSON.stringify({ success: false, error: "Error fetching recipients: " + msg }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (recipients.length === 0) {
      const message = "No recipients found for this campaign";
      console.error(message);
      return new Response(
        JSON.stringify({ success: false, message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${recipients.length} recipients for campaign ${campaignId}`);

    let contentTitle = campaign.subject || "";
    if (campaign.content_type && campaign.content_id) {
      const contentTable = campaign.content_type;
      const titleField = contentTable === 'schools' ? 'name' : 'title';
      try {
        const { data: content, error: contentError } = await supabaseClient
          .from(contentTable)
          .select(`id, ${titleField}`)
          .eq('id', campaign.content_id)
          .single();
        if (!contentError && content) {
          contentTitle = content[titleField] || contentTitle;
        }
      } catch (contentErr) {
        console.error("Error fetching campaign content:", contentErr);
      }
    }

    let auth, gmail;
    try {
      auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
          private_key: Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/gmail.send'],
      });
      gmail = google.gmail({ version: 'v1', auth });
      await auth.actAs(Deno.env.get('GOOGLE_CALENDAR_EMAIL'));
    } catch (gmailError) {
      const msg = "Failed to configure Gmail API: " + (gmailError as Error).message;
      console.error(msg);
      return new Response(
        JSON.stringify({ success: false, error: msg }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const batchedRecipients = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batchedRecipients.push(recipients.slice(i, i + batchSize));
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors = [];
    const processedRecipientIds: string[] = [];
    const startTime = Date.now();

    for (let batchIndex = 0; batchIndex < batchedRecipients.length; batchIndex++) {
      const batch = batchedRecipients[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batchedRecipients.length} with ${batch.length} recipients`);
      const batchPromises = batch.map(async (recipient) => {
        try {
          const emailContent = generateEmailContent(
            campaign.subject || contentTitle,
            campaign.body || `Check out this featured ${campaign.content_type?.slice(0, -1) || 'content'}!`,
            recipient.full_name || "Valued Member",
            campaign.id
          );
          const str = [
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `To: ${recipient.email}`,
            'From: PicoCareer <info@picocareer.com>',
            `Subject: ${campaign.subject || contentTitle}`,
            '',
            emailContent
          ].join('\n');
          const encodedMessage = btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
              raw: encodedMessage,
            },
          });
          console.log(`Email sent to ${recipient.email} (${recipient.id})`);
          processedRecipientIds.push(recipient.id);
          sentCount++;
          return { success: true, recipient_id: recipient.id, email: recipient.email };
        } catch (error) {
          failedCount++;
          const errMsg = (error as Error).message || error;
          errors.push({ recipient_id: recipient.id, email: recipient.email, error: errMsg });
          console.error(`Error sending email to ${recipient.email}:`, errMsg);
          return { success: false, recipient_id: recipient.id, email: recipient.email, error: errMsg };
        }
      });
      await Promise.all(batchPromises);
      if (batchIndex < batchedRecipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const executionTime = (Date.now() - startTime) / 1000;

    const campaignUpdateData: any = {
      status: sentCount > 0 ? (failedCount > 0 ? 'partial' : 'sent') : 'failed',
      sent_at: new Date().toISOString(),
      recipients_count: recipients.length,
      sent_count: sentCount,
      failed_count: failedCount
    };

    try {
      const { error: updateError } = await supabaseClient
        .from('email_campaigns')
        .update(campaignUpdateData)
        .eq('id', campaignId);
      if (updateError) {
        console.error("Error updating campaign status:", updateError);
      }
    } catch (updateErr) {
      console.error("Exception updating campaign row:", updateErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaignId,
        total_recipients: recipients.length,
        sent: sentCount,
        failed: failedCount,
        execution_time_seconds: executionTime,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error: any) {
    console.error("Edge Function top-level error:", error);
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

/**
 * Generates HTML content for email campaigns
 */
function generateEmailContent(
  title: string,
  body: string,
  recipientName: string,
  campaignId: string
): string {
  const unsubscribeUrl = `${Deno.env.get('PUBLIC_SITE_URL') || 'https://picocareer.com'}/unsubscribe?campaign=${campaignId}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <div style="background-color: #2a2a72; color: white; padding: 12px 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px -20px;">
        <h1 style="margin: 0; font-size: 24px;">${title}</h1>
      </div>
      
      <p style="margin-top: 0;">Hello ${recipientName},</p>
      
      <div style="margin: 20px 0;">
        ${body}
      </div>
      
      <p>Visit <a href="https://picocareer.com" style="color: #2a2a72; text-decoration: none; font-weight: bold;">PicoCareer</a> to learn more and explore related content.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} PicoCareer. All rights reserved.</p>
        <p>
          <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a> from these emails.
        </p>
      </div>
    </div>
  `;
}

serve(handler);
