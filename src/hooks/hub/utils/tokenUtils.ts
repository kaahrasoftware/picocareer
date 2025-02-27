
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function formatToken(token: string): string {
  try {
    // First decode URI component if needed
    const decodedToken = decodeURIComponent(token);
    console.log('Decoded token:', decodedToken);

    // Remove quotes and whitespace
    let cleaned = decodedToken.replace(/['"]/g, '').trim();
    console.log('Cleaned token:', cleaned);
    
    // If the token has no hyphens but is 32 characters, add them
    if (cleaned.length === 32 && !cleaned.includes('-')) {
      cleaned = `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`;
      console.log('Formatted token with hyphens:', cleaned);
    }
    
    // Validate UUID format
    if (!UUID_REGEX.test(cleaned)) {
      console.error('Invalid UUID format:', cleaned);
      throw new Error("Invalid invitation token format");
    }
    
    return cleaned.toLowerCase(); // Ensure consistent case
  } catch (e) {
    console.error('Token formatting error:', e);
    throw new Error("Invalid invitation token format");
  }
}
