
/**
 * Helper function that replaces template variables in the format {{variable_name}}
 * with their corresponding values from the provided data object
 */
export function replaceTemplateVariables(template: string, data: Record<string, any>): string {
  // Return original template if no data provided
  if (!data || Object.keys(data).length === 0) {
    return template;
  }
  
  // Replace all variables in {{variable}} format
  return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const trimmedVar = variable.trim();
    
    // Handle nested properties using dot notation (e.g., "user.name")
    if (trimmedVar.includes('.')) {
      const parts = trimmedVar.split('.');
      let value = data;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          // Return empty string if the property path is invalid
          return '';
        }
      }
      
      return value !== undefined ? String(value) : '';
    }
    
    // Handle direct properties
    return data[trimmedVar] !== undefined ? String(data[trimmedVar]) : '';
  });
}

/**
 * Fetches email template content from the database for a specific admin and content type
 */
export async function fetchTemplateContent(
  supabaseClient: any,
  adminId: string,
  contentType: string
): Promise<{
  header_text?: string;
  intro_text?: string;
  cta_text?: string;
  footer_text?: string;
}> {
  try {
    // Query the email_template_content table for content matching the admin and content type
    const { data, error } = await supabaseClient
      .from('email_template_content')
      .select('*')
      .eq('admin_id', adminId)
      .eq('content_type', contentType)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      // Log the error but don't throw, so we can provide defaults
      console.warn(`Error fetching template content: ${error.message}`);
    }
    
    // Return the template content if found, or an empty object if not
    if (data) {
      console.log(`Template content found for content_type: ${contentType}`);
      return {
        header_text: data.header_text,
        intro_text: data.intro_text,
        cta_text: data.cta_text,
        footer_text: data.footer_text
      };
    } else {
      console.log(`No template content found for content_type: ${contentType}, using defaults`);
      return {
        header_text: `Latest ${contentType}`,
        intro_text: `Check out these ${contentType} that match your interests!`,
        cta_text: `View more ${contentType} on our website`,
        footer_text: `© ${new Date().getFullYear()} All rights reserved.`
      };
    }
  } catch (err) {
    console.error(`Exception fetching template content: ${err}`);
    // Return default content in case of errors
    return {
      header_text: `Latest ${contentType}`,
      intro_text: `Check out these ${contentType} that match your interests!`,
      cta_text: `View more ${contentType} on our website`,
      footer_text: `© ${new Date().getFullYear()} All rights reserved.`
    };
  }
}
