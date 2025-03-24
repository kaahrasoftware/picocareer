
// Define notification categories
export type NotificationCategory = 'general' | 'mentorship' | 'hub';

// Helper function to get notification category
export function getNotificationCategory(type?: string): NotificationCategory {
  if (!type) return 'general';
  
  // Map notification types to categories
  if (type.includes('session') || type.includes('mentor')) {
    return 'mentorship';
  } else if (type.includes('hub')) {
    return 'hub';
  }
  
  return 'general';
}
