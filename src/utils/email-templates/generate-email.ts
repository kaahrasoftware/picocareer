
import { ContentItem, EmailContentTypeSettings } from "@/types/database/email";
import { supabase } from "@/integrations/supabase/client";
import { formatContentCard } from "./content-cards";
import { getContentTypeStyles } from "./styles";

/**
 * Generates complete HTML email content from templates stored in the database
 */
export async function generateEmailFromTemplates(
  adminId: string,
  contentType: string,
  title: string,
  introText: string,
  recipientName: string,
  contentItems: ContentItem[],
  siteUrl: string,
  ctaText?: string
): Promise<string> {
  try {
    // Get content type specific settings
    const { data: settings } = await supabase
      .from('email_content_type_settings')
      .select('*')
      .eq('admin_id', adminId)
      .eq('content_type', contentType)
      .single();

    // Fallback colors if settings not found
    const styles = settings ? {
      primary: settings.primary_color,
      secondary: settings.secondary_color,
      accent: settings.accent_color
    } : getContentTypeStyles(contentType);

    // Get header template
    const { data: headerTemplate } = await supabase
      .from('email_html_templates')
      .select('html_content')
      .eq('admin_id', adminId)
      .eq('template_type', 'header')
      .eq('content_type', contentType)
      .single()
      .catch(() => supabase
        .from('email_html_templates')
        .select('html_content')
        .eq('admin_id', adminId)
        .eq('template_type', 'header')
        .eq('content_type', 'universal')
        .single()
      );

    // Get footer template
    const { data: footerTemplate } = await supabase
      .from('email_html_templates')
      .select('html_content')
      .eq('admin_id', adminId)
      .eq('template_type', 'footer')
      .eq('content_type', contentType)
      .single()
      .catch(() => supabase
        .from('email_html_templates')
        .select('html_content')
        .eq('admin_id', adminId)
        .eq('template_type', 'footer')
        .eq('content_type', 'universal')
        .single()
      );

    // Get base template
    const { data: baseTemplate } = await supabase
      .from('email_html_templates')
      .select('html_content')
      .eq('admin_id', adminId)
      .eq('template_type', 'base')
      .eq('content_type', contentType)
      .single()
      .catch(() => supabase
        .from('email_html_templates')
        .select('html_content')
        .eq('admin_id', adminId)
        .eq('template_type', 'base')
        .eq('content_type', 'universal')
        .single()
      );

    // Create content cards HTML
    let contentCardsHtml = '';
    if (contentItems && contentItems.length > 0) {
      // Get content card template if available
      const { data: cardTemplate } = await supabase
        .from('email_html_templates')
        .select('html_content')
        .eq('admin_id', adminId)
        .eq('template_type', 'content_card')
        .eq('content_type', contentType)
        .single()
        .catch(() => supabase
          .from('email_html_templates')
          .select('html_content')
          .eq('admin_id', adminId)
          .eq('template_type', 'content_card')
          .eq('content_type', 'universal')
          .single()
        );

      // Use template to create content cards if available, otherwise use default formatter
      if (cardTemplate && cardTemplate.html_content) {
        contentCardsHtml = contentItems.map(item => {
          let html = cardTemplate.html_content;
          // Replace variables in the template
          html = html.replace(/{{title}}/g, item.title || '');
          html = html.replace(/{{description}}/g, item.description || '');
          html = html.replace(/{{image_url}}/g, item.cover_image_url || item.image_url || item.avatar_url || '');
          html = html.replace(/{{link}}/g, `${siteUrl}/${contentType}/${item.id}`);
          html = html.replace(/{{author}}/g, item.author_name || '');
          html = html.replace(/{{date}}/g, item.created_at ? new Date(item.created_at).toLocaleDateString() : '');
          html = html.replace(/{{primary_color}}/g, styles.primary);
          html = html.replace(/{{secondary_color}}/g, styles.secondary);
          html = html.replace(/{{accent_color}}/g, styles.accent);
          return html;
        }).join('');
      } else {
        // Use default formatter if no template is found
        contentCardsHtml = contentItems.map(item => formatContentCard(
          item,
          contentType,
          siteUrl,
          styles,
          settings?.layout_settings
        )).join('');
      }
    } else {
      contentCardsHtml = '<p style="text-align: center; padding: 20px; color: #6b7280;">No items to display.</p>';
    }

    // Prepare header HTML
    let headerHtml = headerTemplate?.html_content || '';
    headerHtml = headerHtml.replace(/{{title}}/g, title);
    headerHtml = headerHtml.replace(/{{primary_color}}/g, styles.primary);
    headerHtml = headerHtml.replace(/{{secondary_color}}/g, styles.secondary);
    headerHtml = headerHtml.replace(/{{accent_color}}/g, styles.accent);
    
    const logoUrl = settings?.layout_settings?.logo_url || '';
    if (logoUrl) {
      headerHtml = headerHtml.replace(/{{#if logo_url}}([^]*){{\/if}}/g, (match, content) => {
        return content.replace(/{{logo_url}}/g, logoUrl);
      });
    } else {
      headerHtml = headerHtml.replace(/{{#if logo_url}}([^]*){{\/if}}/g, '');
    }

    // Prepare footer HTML
    let footerHtml = footerTemplate?.html_content || '';
    const unsubscribeUrl = `${siteUrl}/unsubscribe`;
    footerHtml = footerHtml.replace(/{{current_year}}/g, new Date().getFullYear().toString());
    footerHtml = footerHtml.replace(/{{unsubscribe_url}}/g, unsubscribeUrl);
    footerHtml = footerHtml.replace(/{{site_url}}/g, siteUrl);
    footerHtml = footerHtml.replace(/{{primary_color}}/g, styles.primary);
    footerHtml = footerHtml.replace(/{{secondary_color}}/g, styles.secondary);
    footerHtml = footerHtml.replace(/{{accent_color}}/g, styles.accent);

    // Prepare base template with all components
    let emailHtml = baseTemplate?.html_content || '';
    
    // Replace all tokens in the base template
    emailHtml = emailHtml.replace(/{{title}}/g, title);
    emailHtml = emailHtml.replace(/{{{header_template}}}/g, headerHtml);
    emailHtml = emailHtml.replace(/{{{content_cards}}}/g, contentCardsHtml);
    emailHtml = emailHtml.replace(/{{{footer_template}}}/g, footerHtml);
    emailHtml = emailHtml.replace(/{{primary_color}}/g, styles.primary);
    emailHtml = emailHtml.replace(/{{secondary_color}}/g, styles.secondary);
    emailHtml = emailHtml.replace(/{{accent_color}}/g, styles.accent);
    emailHtml = emailHtml.replace(/{{site_url}}/g, siteUrl);
    emailHtml = emailHtml.replace(/{{unsubscribe_url}}/g, unsubscribeUrl);
    emailHtml = emailHtml.replace(/{{intro_text}}/g, introText || '');
    emailHtml = emailHtml.replace(/{{cta_text}}/g, ctaText || '');

    // Handle recipient name conditionals
    if (recipientName) {
      emailHtml = emailHtml.replace(/{{#if recipient_name}}([^]*){{\/if}}/g, (match, content) => {
        return content.replace(/{{recipient_name}}/g, recipientName);
      });
    } else {
      emailHtml = emailHtml.replace(/{{#if recipient_name}}([^]*){{\/if}}/g, '');
    }

    return emailHtml;
  } catch (error) {
    console.error("Error generating email from templates:", error);
    throw error;
  }
}
