
export const getContentTypeStyles = (contentType: string) => {
  switch (contentType) {
    case 'scholarships':
      return {
        gradient: 'background: linear-gradient(135deg, #9333ea, #6b21a8)',
        accent: '#9333ea',
        icon: '🎓'
      };
    case 'opportunities':
      return {
        gradient: 'background: linear-gradient(135deg, #2563eb, #1d4ed8)',
        accent: '#2563eb',
        icon: '🚀'
      };
    case 'careers':
      return {
        gradient: 'background: linear-gradient(135deg, #0d9488, #0f766e)',
        accent: '#0d9488',
        icon: '💼'
      };
    case 'majors':
      return {
        gradient: 'background: linear-gradient(135deg, #4f46e5, #4338ca)',
        accent: '#4f46e5',
        icon: '📚'
      };
    case 'schools':
      return {
        gradient: 'background: linear-gradient(135deg, #0ea5e9, #0284c7)',
        accent: '#0ea5e9',
        icon: '🏛️'
      };
    case 'mentors':
      return {
        gradient: 'background: linear-gradient(135deg, #d97706, #b45309)',
        accent: '#d97706',
        icon: '👋'
      };
    case 'blogs':
      return {
        gradient: 'background: linear-gradient(135deg, #e11d48, #be123c)',
        accent: '#e11d48',
        icon: '📖'
      };
    default:
      return {
        gradient: 'background: linear-gradient(135deg, #6b7280, #4b5563)',
        accent: '#6b7280',
        icon: '📎'
      };
  }
};
