
export function getContentTypeStyles(contentType: string) {
  switch (contentType) {
    case 'scholarships':
      return 'bg-gradient-to-br from-purple-50/90 via-purple-100/50 to-white border-purple-200/60 hover:border-purple-300/80';
    case 'opportunities':
      return 'bg-gradient-to-br from-blue-50/90 via-blue-100/50 to-white border-blue-200/60 hover:border-blue-300/80';
    case 'careers':
      return 'bg-gradient-to-br from-teal-50/90 via-teal-100/50 to-white border-teal-200/60 hover:border-teal-300/80';
    case 'majors':
      return 'bg-gradient-to-br from-indigo-50/90 via-indigo-100/50 to-white border-indigo-200/60 hover:border-indigo-300/80';
    case 'schools':
      return 'bg-gradient-to-br from-sky-50/90 via-sky-100/50 to-white border-sky-200/60 hover:border-sky-300/80';
    case 'mentors':
      return 'bg-gradient-to-br from-amber-50/90 via-amber-100/50 to-white border-amber-200/60 hover:border-amber-300/80';
    case 'blogs':
      return 'bg-gradient-to-br from-rose-50/90 via-rose-100/50 to-white border-rose-200/60 hover:border-rose-300/80';
    default:
      return 'bg-gradient-to-br from-gray-50/90 via-gray-100/50 to-white border-gray-200/60 hover:border-gray-300/80';
  }
}

export function getStatusStyles(status: string) {
  switch (status) {
    case 'sent':
      return 'bg-gradient-to-br from-green-50/90 to-green-100/50 border-green-200 hover:shadow-green-100/50';
    case 'sending':
      return 'bg-gradient-to-br from-blue-50/90 to-blue-100/50 border-blue-200 hover:shadow-blue-100/50';
    case 'pending':
      return 'bg-gradient-to-br from-amber-50/90 to-amber-100/50 border-amber-200 hover:shadow-amber-100/50';
    case 'partial':
      return 'bg-gradient-to-br from-orange-50/90 to-orange-100/50 border-orange-200 hover:shadow-orange-100/50';
    case 'failed':
      return 'bg-gradient-to-br from-red-50/90 to-red-100/50 border-red-200 hover:shadow-red-100/50';
    default:
      return 'bg-gradient-to-br from-gray-50/90 to-gray-100/50 border-gray-200 hover:shadow-gray-100/50';
  }
}
