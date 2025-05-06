/**
 * Simple template variable replacement function
 * Replaces variables in format {{variable_name}} with their values
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number | boolean | undefined>
): string {
  let result = template;
  
  // Replace each variable in the template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value?.toString() || '');
  });
  
  // Handle conditional blocks
  result = handleConditionalBlocks(result, variables);
  
  return result;
}

/**
 * Handles conditional blocks in a template
 * Format: {{#if variable}}content{{/if}}
 */
function handleConditionalBlocks(
  template: string,
  variables: Record<string, string | number | boolean | undefined>
): string {
  // Match conditional blocks: {{#if variable}}content{{/if}}
  const conditionalBlockRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;
  
  return template.replace(conditionalBlockRegex, (match, condition, content) => {
    const conditionValue = variables[condition.trim()];
    
    // If the condition variable is truthy, include the content
    if (conditionValue) {
      return replaceTemplateVariables(content, variables);
    }
    
    // Otherwise, remove the block
    return '';
  });
}

/**
 * Fetch email template content from the database and apply settings
 */
export async function fetchTemplateContent(
  supabaseClient: any,
  adminId: string,
  contentType: string
): Promise<Record<string, string>> {
  try {
    // Fetch content type specific content
    const { data: templateContent, error: contentError } = await supabaseClient
      .from('email_template_content')
      .select('*')
      .eq('admin_id', adminId)
      .eq('content_type', contentType)
      .single();
    
    if (contentError && contentError.code !== 'PGRST116') {
      console.warn("Error fetching template content:", contentError);
    }
    
    if (templateContent) {
      return {
        header_text: templateContent.header_text || '',
        intro_text: templateContent.intro_text || '',
        cta_text: templateContent.cta_text || '',
        footer_text: templateContent.footer_text || ''
      };
    }
    
    return {};
  } catch (error) {
    console.error("Error in fetchTemplateContent:", error);
    return {};
  }
}
