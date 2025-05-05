
export type ContentType = 'blog' | 'event' | 'news' | 'update' | 'promotion' | 'announcement' | 'scholarships' | 'opportunities' | 'careers' | 'majors' | 'schools' | 'mentors';

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  blog: 'Blog Posts',
  event: 'Events',
  news: 'News Articles',
  update: 'Updates',
  promotion: 'Promotions',
  announcement: 'Announcements',
  scholarships: 'Scholarships',
  opportunities: 'Opportunities',
  careers: 'Careers',
  majors: 'Majors',
  schools: 'Schools',
  mentors: 'Mentors'
};

export type RecipientType = 'all' | 'mentees' | 'mentors' | 'selected';

export const RECIPIENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'mentees', label: 'All Mentees' },
  { value: 'mentors', label: 'All Mentors' },
  { value: 'selected', label: 'Selected Users' }
];
