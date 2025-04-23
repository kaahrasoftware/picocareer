
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
    const { campaignId, batchSize = 50 }: CampaignEmailRequest = await req.json();
    
    if (!campaignId) {
      throw new Error("Campaign ID is required");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Campaign not found: ${campaignError?.message || "Unknown error"}`);
    }

    // Get recipients based on recipient_type
    let recipients: { id: string; email: string; full_name?: string }[] = [];
    
    if (campaign.recipient_type === 'selected' && campaign.recipient_filter?.profile_ids) {
      // Get selected recipients
      const { data: selectedRecipients, error: recipientsError } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name')
        .in('id', campaign.recipient_filter.profile_ids);
      
      if (recipientsError) {
        throw new Error(`Error fetching selected recipients: ${recipientsError.message}`);
      }
      
      recipients = selectedRecipients || [];
    } else {
      // Get recipients based on type (all, mentees, mentors)
      let query = supabaseClient
        .from('profiles')
        .select('id, email, full_name');
      
      // Filter by user type if specified
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

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No recipients found for this campaign" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${recipients.length} recipients for campaign ${campaignId}`);

    // Get content details based on content_type and content_id
    let contentTitle = campaign.subject || "";
    
    if (campaign.content_type && campaign.content_id) {
      const contentTable = campaign.content_type;
      const titleField = contentTable === 'schools' ? 'name' : 'title';
      
      const { data: content, error: contentError } = await supabaseClient
        .from(contentTable)
        .select(`id, ${titleField}`)
        .eq('id', campaign.content_id)
        .single();
      
      if (!contentError && content) {
        contentTitle = content[titleField] || contentTitle;
      }
    }

    // Configure Gmail API with existing credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        private_key: Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    const gmail = google.gmail({ version: 'v1', auth });

    // Impersonate the info@picocareer.com account
    await auth.actAs(Deno.env.get('GOOGLE_CALENDAR_EMAIL'));

    // Process recipients in batches
    const batchedRecipients = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batchedRecipients.push(recipients.slice(i, i + batchSize));
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors = [];
    
    // Track processed recipients
    const processedRecipientIds: string[] = [];

    // Track start time for performance measurement
    const startTime = Date.now();

    // Process each batch
    for (let batchIndex = 0; batchIndex < batchedRecipients.length; batchIndex++) {
      const batch = batchedRecipients[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batchedRecipients.length} with ${batch.length} recipients`);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Generate personalized email content
          const emailContent = generateEmailContent(
            campaign.subject || contentTitle,
            campaign.body || `Check out this featured ${campaign.content_type?.slice(0, -1) || 'content'}!`,
            recipient.full_name || "Valued Member",
            campaign.id
          );

          // Create email message
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

          // Send the email
          const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
              raw: encodedMessage,
            },
          });

          console.log(`Email sent to ${recipient.email} (${recipient.id})`);
          
          // Add recipient to tracking
          processedRecipientIds.push(recipient.id);
          sentCount++;
          
          return { success: true, recipient_id: recipient.id, email: recipient.email };
        } catch (error) {
          console.error(`Error sending email to ${recipient.email}:`, error);
          failedCount++;
          errors.push({ recipient_id: recipient.id, email: recipient.email, error: error.message });
          return { success: false, recipient_id: recipient.id, email: recipient.email, error: error.message };
        }
      });

      // Wait for all emails in this batch to be processed
      await Promise.all(batchPromises);
      
      // Add a small delay between batches to avoid rate limits
      if (batchIndex < batchedRecipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Calculate execution time
    const executionTime = (Date.now() - startTime) / 1000;

    // Update campaign status
    const campaignUpdateData: any = {
      status: sentCount > 0 ? (failedCount > 0 ? 'partial' : 'sent') : 'failed',
      sent_at: new Date().toISOString(),
      recipients_count: recipients.length,
      sent_count: sentCount,
      failed_count: failedCount
    };

    const { error: updateError } = await supabaseClient
      .from('email_campaigns')
      .update(campaignUpdateData)
      .eq('id', campaignId);

    if (updateError) {
      console.error("Error updating campaign status:", updateError);
    }

    // Return summary
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
    console.error("Error in send-campaign-emails function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
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
  // Create unsubscribe link with campaign ID
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
