
import { Resend } from "npm:resend@2.0.0";
import { ContentItem, EmailTemplateSettings } from "./types.ts";
import { generateEmailContent, getEmailSubject } from "./email-templates.ts";
import { fetchTemplateContent } from "./template-renderer.ts";

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
  const retryDelayMs = 1100; // Slightly over 1 second to respect rate limits
  
  // Verify that we have content to send
  if (!contentList || contentList.length === 0) {
    throw new Error(`No content items available to send for campaign type: ${campaign.content_type}`);
  }
  
  // Log content items for debugging
  console.log(`Content items for ${campaign.content_type} campaign:`, 
    contentList.map(item => ({ id: item.id, title: item.title, hasImage: Boolean(item.cover_image_url || item.image_url) }))
  );
  
  // Fetch template settings
  const { data: templateSettings, error: templateError } = await supabaseClient
    .from('email_template_settings')
    .select('*')
    .eq('admin_id', campaign.admin_id)
    .single();

  if (templateError && templateError.code !== 'PGRST116') {
    console.warn("Template settings error:", templateError);
  }

  // Fetch content type specific settings
  const { data: contentTypeSettings, error: contentTypeError } = await supabaseClient
    .from('email_content_type_settings')
    .select('*')
    .eq('admin_id', campaign.admin_id)
    .eq('content_type', campaign.content_type)
    .single();
    
  if (contentTypeError && contentTypeError.code !== 'PGRST116') {
    console.warn("Content type settings error:", contentTypeError);
  }

  // Fetch template content
  const templateContent = await fetchTemplateContent(
    supabaseClient,
    campaign.admin_id,
    campaign.content_type
  );
    
  // Use content type specific settings if available, otherwise fall back to global template settings
  const settings: EmailTemplateSettings = {
    id: contentTypeSettings?.id || templateSettings?.id || '',
    admin_id: campaign.admin_id,
    primary_color: contentTypeSettings?.primary_color || templateSettings?.primary_color || '#8B5CF6',
    secondary_color: contentTypeSettings?.secondary_color || templateSettings?.secondary_color || '#7C3AED',
    accent_color: contentTypeSettings?.accent_color || templateSettings?.accent_color || '#6D28D9',
    logo_url: contentTypeSettings?.logo_url || templateSettings?.logo_url,
    content_type: campaign.content_type,
    layout_settings: contentTypeSettings?.layout_settings || {
      headerStyle: 'centered',
      showAuthor: true,
      showDate: true,
      imagePosition: 'top',
      contentBlocks: ['title', 'image', 'description', 'metadata', 'cta'],
      metadataDisplay: ['category', 'date', 'author']
    },
    content: {
      header_text: templateContent.header_text || campaign.subject,
      intro_text: templateContent.intro_text || campaign.body || `Check out these featured ${campaign.content_type}!`,
      cta_text: templateContent.cta_text || 'Visit our website for more content',
      footer_text: templateContent.footer_text || `© ${new Date().getFullYear()} All rights reserved.`
    },
    created_at: contentTypeSettings?.created_at || templateSettings?.created_at || new Date().toISOString(),
    updated_at: contentTypeSettings?.updated_at || templateSettings?.updated_at || new Date().toISOString()
  };
  
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
            siteUrl,
            settings
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
