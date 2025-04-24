
export function getContentTypeStyles(contentType: string) {
  switch (contentType) {
    case 'scholarships':
      return 'bg-gradient-to-br from-purple-50/90 to-purple-100/50 border-purple-200';
    case 'opportunities':
      return 'bg-gradient-to-br from-blue-50/90 to-blue-100/50 border-blue-200';
    case 'careers':
      return 'bg-gradient-to-br from-teal-50/90 to-teal-100/50 border-teal-200';
    case 'majors':
      return 'bg-gradient-to-br from-indigo-50/90 to-indigo-100/50 border-indigo-200';
    case 'schools':
      return 'bg-gradient-to-br from-sky-50/90 to-sky-100/50 border-sky-200';
    case 'mentors':
      return 'bg-gradient-to-br from-amber-50/90 to-amber-100/50 border-amber-200';
    case 'blogs':
      return 'bg-gradient-to-br from-rose-50/90 to-rose-100/50 border-rose-200';
    default:
      return 'bg-gradient-to-br from-gray-50/90 to-gray-100/50 border-gray-200';
  }
}

export function getStatusStyles(status: string) {
  switch (status) {
    case 'sent':
      return 'bg-gradient-to-br from-green-50/90 to-green-100/50 border-green-200 hover:bg-green-50/80';
    case 'sending':
      return 'bg-gradient-to-br from-blue-50/90 to-blue-100/50 border-blue-200 hover:bg-blue-50/80';
    case 'pending':
      return 'bg-gradient-to-br from-amber-50/90 to-amber-100/50 border-amber-200 hover:bg-amber-50/80';
    case 'partial':
      return 'bg-gradient-to-br from-orange-50/90 to-orange-100/50 border-orange-200 hover:bg-orange-50/80';
    case 'failed':
      return 'bg-gradient-to-br from-red-50/90 to-red-100/50 border-red-200 hover:bg-red-50/80';
    default:
      return 'bg-gradient-to-br from-gray-50/90 to-gray-100/50 border-gray-200 hover:bg-gray-50/80';
  }
}
