
/**
 * Returns styled objects for different content types
 */
export function getContentTypeStyles(contentType: string): { 
  primary: string; 
  secondary: string; 
  accent: string; 
  icon: string;
  gradient: string;
} {
  switch (contentType) {
    case 'scholarships':
      return {
        primary: '#4f46e5',
        secondary: '#3730a3',
        accent: '#4338ca',
        icon: '🎓',
        gradient: 'background: linear-gradient(135deg, #4f46e5, #3730a3)'
      };
    case 'opportunities':
      return {
        primary: '#0e9f6e',
        secondary: '#065f46',
        accent: '#059669',
        icon: '🚀',
        gradient: 'background: linear-gradient(135deg, #0e9f6e, #065f46)'
      };
    case 'careers':
      return {
        primary: '#8b5cf6',
        secondary: '#6d28d9',
        accent: '#7c3aed',
        icon: '💼',
        gradient: 'background: linear-gradient(135deg, #8b5cf6, #6d28d9)'
      };
    case 'majors':
      return {
        primary: '#3b82f6',
        secondary: '#1d4ed8',
        accent: '#2563eb',
        icon: '📚',
        gradient: 'background: linear-gradient(135deg, #3b82f6, #1d4ed8)'
      };
    case 'schools':
      return {
        primary: '#f59e0b',
        secondary: '#b45309',
        accent: '#d97706',
        icon: '🏛️',
        gradient: 'background: linear-gradient(135deg, #f59e0b, #b45309)'
      };
    case 'mentors':
      return {
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#4f46e5',
        icon: '👋',
        gradient: 'background: linear-gradient(135deg, #6366f1, #4f46e5)'
      };
    case 'blogs':
      return {
        primary: '#ec4899',
        secondary: '#be185d',
        accent: '#db2777',
        icon: '📖',
        gradient: 'background: linear-gradient(135deg, #ec4899, #be185d)'
      };
    case 'events':
      return {
        primary: '#ef4444',
        secondary: '#b91c1c',
        accent: '#dc2626',
        icon: '🗓️',
        gradient: 'background: linear-gradient(135deg, #ef4444, #b91c1c)'
      };
    default:
      return {
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#4f46e5',
        icon: '✨',
        gradient: 'background: linear-gradient(135deg, #6366f1, #4f46e5)'
      };
  }
}
