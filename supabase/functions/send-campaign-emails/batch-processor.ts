
import { Resend } from "npm:resend@2.0.0";
import { ContentItem } from "./types.ts";
import { generateEmailContent, getEmailSubject } from "./email-templates.ts";

// Sleep function for rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function processBatchSending(
  recipients: { id: string; email: string; full_name?: string }[],
  contentList: ContentItem[],
  campaign: any,
  batchSize: number,
  siteUrl: string,
  supabaseClient: any,
  resend: Resend
): Promise<{ sent: number, failed: number, errors: any[] }> {
  let sentCount = 0;
  let failedCount = 0;
  const errors = [];
  const processedRecipientIds: string[] = [];
  const retryDelayMs = 1100; // Slightly over 1 second to be safe with rate limits
  
  // Process in smaller batches of 2 (respecting rate limit)
  const microBatchSize = 2;
  
  for (let i = 0; i < recipients.length; i += microBatchSize) {
    const batch = recipients.slice(i, i + microBatchSize);
    console.log(`Processing micro-batch ${Math.floor(i/microBatchSize) + 1} of ${Math.ceil(recipients.length/microBatchSize)} (${batch.length} recipients)`);
    
    // Process each recipient in the micro-batch with retries
    for (const recipient of batch) {
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;

      while (!success && retryCount < maxRetries) {
        try {
          if (!recipient.email || !recipient.email.includes('@')) {
            throw new Error(`Invalid email format: ${recipient.email}`);
          }
          
          const recipientName = recipient.full_name?.split(' ')[0] || '';
          const emailSubject = campaign.subject || getEmailSubject(campaign.content_type, recipientName);
          
          const emailContent = generateEmailContent(
            emailSubject,
            campaign.body || `Check out these featured ${campaign.content_type}!`,
            recipient.full_name || '',
            campaign.id,
            contentList,
            campaign.content_type,
            siteUrl
          );
          
          const res = await resend.emails.send({
            from: "PicoCareer <info@picocareer.com>",
            to: [recipient.email],
            subject: emailSubject,
            html: emailContent,
          });
          
          if (res.error) {
            throw new Error(res.error.message || JSON.stringify(res.error));
          }
          
          processedRecipientIds.push(recipient.id);
          sentCount++;
          success = true;
          console.log(`Successfully sent email to ${recipient.email}`);
          
        } catch (error) {
          retryCount++;
          const errMsg = (error as Error).message || String(error);
          
          if (retryCount === maxRetries) {
            failedCount++;
            errors.push({ 
              recipient_id: recipient.id, 
              email: recipient.email, 
              error: errMsg,
              retries: retryCount
            });
            console.error(`Final failure for ${recipient.email} after ${retryCount} retries: ${errMsg}`);
          } else {
            console.log(`Attempt ${retryCount} failed for ${recipient.email}: ${errMsg}. Retrying after delay...`);
            await sleep(retryDelayMs * (retryCount + 1)); // Exponential backoff
          }
        }
      }
    }
    
    // Wait between micro-batches to respect rate limits
    if (i + microBatchSize < recipients.length) {
      await sleep(retryDelayMs);
    }
  }
  
  return { sent: sentCount, failed: failedCount, errors };
}
