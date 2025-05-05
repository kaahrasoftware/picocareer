
export type ContentType = 'blogs' | 'careers' | 'events' | 'majors' | 'mentors' | 'opportunities' | 'scholarships' | 'schools';

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  blogs: 'Blogs',
  careers: 'Careers',
  events: 'Events',
  majors: 'Majors',
  mentors: 'Mentors',
  opportunities: 'Opportunities',
  scholarships: 'Scholarships',
  schools: 'Schools'
};

export type RecipientType = 'all' | 'mentees' | 'mentors' | 'selected' | 'event_registrants';

export const RECIPIENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'mentees', label: 'All Mentees' },
  { value: 'mentors', label: 'All Mentors' },
  { value: 'selected', label: 'Selected Users' },
  { value: 'event_registrants', label: 'Event Registrants' }
];
