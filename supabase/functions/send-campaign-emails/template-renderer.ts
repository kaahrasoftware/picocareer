
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
