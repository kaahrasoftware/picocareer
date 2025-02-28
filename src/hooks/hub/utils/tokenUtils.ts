
/**
 * Format a token input to remove any extra spaces or hyphens
 * and ensure it's in the correct UUID format
 */
export function formatToken(inputToken: string): string {
  if (!inputToken) {
    throw new Error("Token is required");
  }

  // Clean up the token
  let cleanToken = inputToken.trim();
  
  // Remove any URL parameters (e.g., if the token came from a URL)
  if (cleanToken.includes('?')) {
    cleanToken = cleanToken.split('?')[0];
  }
  
  // Check if it's already a UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(cleanToken)) {
    return cleanToken;
  }
  
  // Handle tokens without hyphens
  if (cleanToken.length === 32 && cleanToken.match(/^[0-9a-f]{32}$/i)) {
    return [
      cleanToken.slice(0, 8),
      cleanToken.slice(8, 12),
      cleanToken.slice(12, 16),
      cleanToken.slice(16, 20),
      cleanToken.slice(20)
    ].join('-');
  }
  
  // Remove all non-alphanumeric characters and try to format it
  const strippedToken = cleanToken.replace(/[^a-f0-9]/gi, '');
  if (strippedToken.length === 32 && strippedToken.match(/^[0-9a-f]{32}$/i)) {
    return [
      strippedToken.slice(0, 8),
      strippedToken.slice(8, 12),
      strippedToken.slice(12, 16),
      strippedToken.slice(16, 20),
      strippedToken.slice(20)
    ].join('-');
  }
  
  throw new Error("Invalid token format");
}
