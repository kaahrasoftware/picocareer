
import { Resend } from "npm:resend@2.0.0";
import { ContentItem } from "./types";
import { generateEmailContent, getEmailSubject } from "./email-templates";

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
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(recipients.length/batchSize)} (${batch.length} recipients)`);
    
    const batchPromises = batch.map(async (recipient) => {
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
        
        return { success: true, recipient_id: recipient.id, email: recipient.email };
        
      } catch (error) {
        failedCount++;
        const errMsg = (error as Error).message || String(error);
        errors.push({ 
          recipient_id: recipient.id, 
          email: recipient.email, 
          error: errMsg 
        });
        
        console.error(`Email send failure for ${recipient.email}: ${errMsg}`);
        return { success: false, recipient_id: recipient.id, email: recipient.email, error: errMsg };
      }
    });
    
    await Promise.all(batchPromises);
    
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { sent: sentCount, failed: failedCount, errors };
}
