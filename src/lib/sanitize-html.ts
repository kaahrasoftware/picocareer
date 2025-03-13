
import DOMPurify from 'dompurify';
import { notificationContentStyles, applyStylesToHtml } from './notification-styles';

/**
 * Configuration for DOMPurify
 * Defining allowed tags and attributes
 */
const purifyConfig = {
  ALLOWED_TAGS: [
    'a', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'i', 'li', 'ol', 'p', 'span', 'strong', 'ul', 'table', 'tbody',
    'td', 'th', 'thead', 'tr', 'hr', 'img'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'class', 'style', 'src', 'alt', 'width', 'height'
  ],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  ALLOW_DATA_ATTR: false
};

/**
 * Sanitizes HTML content to prevent XSS attacks and applies styling
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML content with applied styling
 */
export function sanitizeHtml(content: string): string {
  if (!content) return '';
  
  // Check if running in a browser environment
  if (typeof window === 'undefined') {
    return content;
  }
  
  try {
    // First apply our styles to the HTML
    const styledHtml = applyStylesToHtml(content, notificationContentStyles);
    
    // Configure and apply DOMPurify
    DOMPurify.setConfig(purifyConfig);
    return DOMPurify.sanitize(styledHtml);
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    // Return plain text if sanitization fails
    return content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
