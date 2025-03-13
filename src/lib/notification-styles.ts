
/**
 * Styles for HTML content in notifications
 * Used to style HTML elements rendered in notification messages
 */
export const notificationContentStyles = {
  // Basic text styling
  p: "mb-2 text-sm",
  h1: "text-lg font-bold mb-2",
  h2: "text-md font-semibold mb-2",
  h3: "text-base font-medium mb-2",
  
  // List styling
  ul: "list-disc pl-4 mb-2",
  ol: "list-decimal pl-4 mb-2",
  li: "mb-1 text-sm",
  
  // Table styling
  table: "w-full border-collapse mb-2",
  th: "border border-gray-300 px-2 py-1 bg-gray-100 font-medium text-left text-xs",
  td: "border border-gray-300 px-2 py-1 text-left text-xs",
  
  // Link styling
  a: "text-blue-500 hover:text-blue-700 hover:underline",
  
  // Emphasis
  strong: "font-bold",
  em: "italic",
  b: "font-bold",
  i: "italic",
  
  // Horizontal rule
  hr: "my-2 border-t border-gray-200",
  
  // Image
  img: "max-w-full h-auto rounded my-2",
  
  // Break
  br: ""
};

/**
 * Applies CSS classes to an HTML string based on provided styles
 * @param html - The HTML string to modify
 * @param styles - Object containing element tag to CSS class mappings
 * @returns Modified HTML string with added CSS classes
 */
export function applyStylesToHtml(html: string, styles: Record<string, string> = notificationContentStyles): string {
  if (!html) return '';
  
  let modifiedHtml = html;
  
  // Apply styles to each specified tag
  Object.entries(styles).forEach(([tag, cssClass]) => {
    // Regular expression to match tags (both opening without attributes and opening with attributes)
    const tagRegexBasic = new RegExp(`<${tag}(?!\\s|>)>`, 'g');
    const tagRegexWithAttrs = new RegExp(`<${tag}(\\s[^>]*)>`, 'g');
    
    // Replace tags with no attributes
    modifiedHtml = modifiedHtml.replace(tagRegexBasic, `<${tag} class="${cssClass}">`);
    
    // Replace tags with existing attributes (preserving those attributes)
    modifiedHtml = modifiedHtml.replace(tagRegexWithAttrs, (match, attributes) => {
      // If there's already a class attribute, append to it
      if (attributes.includes('class="')) {
        return match.replace(/class="([^"]*)"/, (m, existingClasses) => {
          return `class="${existingClasses} ${cssClass}"`;
        });
      } else {
        // Add class attribute
        return `<${tag}${attributes} class="${cssClass}">`;
      }
    });
  });
  
  return modifiedHtml;
}
