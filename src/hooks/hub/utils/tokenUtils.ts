
/**
 * Format a token input to remove any extra spaces or hyphens
 * and ensure it's in the correct UUID format
 */
export function formatToken(inputToken: string): string {
  if (!inputToken) {
    throw new Error("Token is required");
  }

  // Clean up the token by removing all whitespace
  let cleanToken = inputToken.trim().replace(/\s+/g, '');
  
  // Remove any URL parameters (e.g., if the token came from a URL)
  if (cleanToken.includes('?')) {
    cleanToken = cleanToken.split('?')[0];
  }
  
  // Check if it's already a UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(cleanToken)) {
    return cleanToken;
  }
  
  // Remove all non-alphanumeric characters
  const strippedToken = cleanToken.replace(/[^a-f0-9]/gi, '');
  
  // Check if we have exactly 32 characters after stripping
  if (strippedToken.length === 32 && strippedToken.match(/^[0-9a-f]{32}$/i)) {
    // Format as UUID
    return [
      strippedToken.slice(0, 8),
      strippedToken.slice(8, 12),
      strippedToken.slice(12, 16),
      strippedToken.slice(16, 20),
      strippedToken.slice(20)
    ].join('-');
  }
  
  // If we get here, the token format is invalid
  throw new Error("Invalid token format. Please check the invitation link and try again.");
}

/**
 * Pre-validate a token to check if it looks like a valid UUID format
 * without throwing errors - useful for form validation
 */
export function isValidTokenFormat(inputToken: string): boolean {
  if (!inputToken || inputToken.trim() === '') {
    return false;
  }
  
  try {
    // Try to format it - if it succeeds, it's valid
    formatToken(inputToken);
    return true;
  } catch (error) {
    return false;
  }
}
