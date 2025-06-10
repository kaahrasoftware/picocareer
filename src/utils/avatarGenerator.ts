
// Default avatar types available
export type DefaultAvatarType = 
  | 'adventurer'
  | 'big-smile'
  | 'bottts'
  | 'croodles'
  | 'fun-emoji'
  | 'identicon'
  | 'initials'
  | 'lorelei'
  | 'micah'
  | 'miniavs'
  | 'open-peeps'
  | 'personas'
  | 'pixel-art';

// Generate a deterministic avatar based on user ID
export function generateDefaultAvatar(userId: string): string {
  const avatarTypes: DefaultAvatarType[] = [
    'adventurer',
    'big-smile',
    'bottts',
    'croodles',
    'fun-emoji',
    'identicon',
    'lorelei',
    'micah',
    'miniavs',
    'open-peeps',
    'personas',
    'pixel-art'
  ];

  // Create a simple hash from the user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Get a positive index
  const index = Math.abs(hash) % avatarTypes.length;
  const selectedType = avatarTypes[index];

  // Generate avatar URL using DiceBear API
  return `https://api.dicebear.com/7.x/${selectedType}/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

// Get all available avatar types for the picker
export function getAvailableAvatarTypes(): DefaultAvatarType[] {
  return [
    'adventurer',
    'big-smile',
    'bottts',
    'croodles',
    'fun-emoji',
    'identicon',
    'lorelei',
    'micah',
    'miniavs',
    'open-peeps',
    'personas',
    'pixel-art'
  ];
}

// Generate avatar URL for a specific type and user
export function generateAvatarForType(userId: string, type: DefaultAvatarType): string {
  return `https://api.dicebear.com/7.x/${type}/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

// Check if a URL is a default avatar
export function isDefaultAvatar(url: string): boolean {
  return url.includes('api.dicebear.com');
}
