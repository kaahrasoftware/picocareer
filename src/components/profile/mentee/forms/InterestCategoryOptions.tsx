
export const INTEREST_OPTIONS = {
  extracurricular: [
    'Sports (Basketball, Soccer, Tennis, etc.)',
    'Debate Team',
    'Drama/Theater',
    'Music (Band, Choir, Orchestra)',
    'Student Government',
    'Volunteering/Community Service',
    'Academic Clubs (Math, Science, etc.)',
    'Art Club',
    'Photography Club',
    'Robotics Club',
    'Model UN',
    'Newspaper/Journalism',
    'Yearbook',
    'National Honor Society',
    'Cultural Clubs'
  ],
  hobby: [
    'Reading',
    'Gaming (Video Games, Board Games)',
    'Cooking/Baking',
    'Photography',
    'Travel',
    'Fitness/Working Out',
    'Art/Drawing/Painting',
    'Writing/Creative Writing',
    'Music (Playing Instruments, Listening)',
    'Gardening',
    'Crafting/DIY Projects',
    'Collecting (Books, Comics, etc.)',
    'Hiking/Outdoor Activities',
    'Dancing',
    'Film/Movie Watching',
    'Learning Languages',
    'Meditation/Mindfulness',
    'Fashion/Style',
    'Social Media Content Creation'
  ],
  industry: [
    'Technology/Software',
    'Healthcare/Medical',
    'Finance/Banking',
    'Education/Teaching',
    'Manufacturing',
    'Marketing/Advertising',
    'Consulting',
    'Real Estate',
    'Entertainment/Media',
    'Non-profit/Social Impact',
    'Government/Public Service',
    'Energy/Utilities',
    'Transportation/Logistics',
    'Retail/E-commerce',
    'Agriculture/Food',
    'Construction/Architecture',
    'Hospitality/Tourism',
    'Sports/Recreation',
    'Legal/Law',
    'Research/Academia'
  ],
  skill: [
    'Programming/Coding',
    'Public Speaking',
    'Leadership',
    'Writing',
    'Graphic Design',
    'Data Analysis',
    'Project Management',
    'Communication',
    'Problem Solving',
    'Critical Thinking',
    'Teamwork/Collaboration',
    'Time Management',
    'Research',
    'Foreign Languages',
    'Sales/Negotiation',
    'Teaching/Mentoring',
    'Creative Thinking',
    'Technical Writing',
    'Digital Marketing',
    'Financial Analysis'
  ]
} as const;

export type InterestCategory = keyof typeof INTEREST_OPTIONS | 'career' | 'academic';
