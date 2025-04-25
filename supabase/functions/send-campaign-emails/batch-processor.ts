
import { Resend } from "npm:resend@2.0.0";
import { ContentItem, EmailContentTypeSettings } from "./types.ts";
import { generateEmailContent, getEmailSubject } from "./email-templates.ts";

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
  
  // Fetch template settings for this content type
  let templateSettings = null;
  try {
    // First try to get content-type specific settings
    const { data: contentTypeSettings, error: contentTypeError } = await supabaseClient
      .from('email_content_type_settings')
      .select('*')
      .eq('admin_id', campaign.admin_id)
      .eq('content_type', campaign.content_type)
      .single();
      
    if (contentTypeSettings) {
      templateSettings = contentTypeSettings;
      console.log(`Using content-type specific template settings for ${campaign.content_type}`);
    } else if (!contentTypeError || contentTypeError.code === 'PGRST116') {
      // If no content-type specific settings, try to get global template settings
      const { data: globalSettings } = await supabaseClient
        .from('email_template_settings')
        .select('*')
        .eq('admin_id', campaign.admin_id)
        .single();
        
      if (globalSettings) {
        // Convert global settings to the format expected by email generator
        templateSettings = {
          ...globalSettings,
          content_type: campaign.content_type,
          layout_settings: {
            headerStyle: 'centered',
            showAuthor: true,
            showDate: true,
            imagePosition: 'top',
            contentBlocks: ['title', 'image', 'description', 'cta'],
            metadataDisplay: ['category', 'date', 'author']
          }
        };
        console.log('Using global template settings');
      }
    }
  } catch (error) {
    // Log but don't fail if we can't get template settings
    console.error('Error fetching template settings:', error);
  }
  
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
        
        // Use template settings when generating email content
        const emailContent = generateEmailContent(
          emailSubject,
          campaign.body || `Check out these featured ${campaign.content_type}!`,
          recipient.full_name || '',
          campaign.id,
          contentList,
          campaign.content_type,
          siteUrl,
          templateSettings
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
