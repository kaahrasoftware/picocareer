
import { Campaign, ContentItem, EmailTemplateSettings } from "./types.ts";
import { generateEmailContent, getEmailSubject } from "./email-templates.ts";
import { updateCampaignStatus } from "./campaign-manager.ts";

interface BatchResult {
  sent: number;
  failed: number;
  errors: any[];
}

export async function processBatchSending(
  recipients: { id: string; email: string; first_name?: string }[],
  contentList: ContentItem[],
  campaign: Campaign,
  batchSize: number,
  siteUrl: string,
  supabase: any,
  resend: any
): Promise<BatchResult> {
  const result: BatchResult = {
    sent: 0,
    failed: 0,
    errors: []
  };

  // Fetch email template settings
  const { data: templateSettings, error: templateError } = await supabase
    .from("email_template_settings")
    .select("*")
    .eq("admin_id", campaign.admin_id)
    .single();

  if (templateError || !templateSettings) {
    console.error("Failed to fetch template settings:", templateError);
    throw new Error("Could not fetch email template settings");
  }

  // Process recipients in batches
  for (let i = 0; i < recipients.length; i += batchSize) {
    const currentBatch = recipients.slice(i, i + batchSize);
    
    // Process each recipient in the current batch
    const batchPromises = currentBatch.map(async (recipient) => {
      try {
        // Generate email HTML for this recipient
        const emailHtml = await generateEmailContent(
          campaign.subject,
          "Here are some personalized recommendations for you:", // Default body, could be from campaign
          recipient.first_name || "",
          campaign.id,
          contentList,
          campaign.content_type,
          siteUrl,
          templateSettings as EmailTemplateSettings,
          supabase
        );
        
        // Get a subject line based on content type
        const subject = campaign.subject || getEmailSubject(campaign.content_type, recipient.first_name);
        
        // Send the email
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "PicoCareer <no-reply@picocareer.com>",
          to: recipient.email,
          subject: subject,
          html: emailHtml,
        });
        
        if (emailError) {
          console.error(`Failed to send email to ${recipient.email}:`, emailError);
          result.failed++;
          result.errors.push({
            email: recipient.email,
            error: emailError.message
          });
          return false;
        }
        
        console.log(`Email sent to ${recipient.email} - ID: ${emailData.id}`);
        result.sent++;
        return true;
      } catch (error) {
        console.error(`Error sending to ${recipient.email}:`, error);
        result.failed++;
        result.errors.push({
          email: recipient.email,
          error: error.message || "Unknown error"
        });
        return false;
      }
    });
    
    await Promise.all(batchPromises);
    
    // Update campaign status after each batch
    await updateCampaignStatus(
      supabase,
      campaign.id,
      result.failed === 0 ? "sent" : (result.sent === 0 ? "failed" : "partial"),
      result.sent,
      result.failed,
      recipients.length,
      result.errors.length > 0 ? JSON.stringify(result.errors.slice(0, 5)) : undefined
    );
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return result;
}
