
import { Guide } from '@/context/GuideContext';

export const programGuide: Guide = {
  id: 'program-search',
  title: 'Program Search Guide',
  description: 'Find and apply to academic programs that match your goals',
  steps: [
    {
      id: 'explore-programs',
      title: 'Explore Academic Programs',
      description: 'Browse universities and programs in your field of interest',
      content: 'Discover academic programs that align with your career goals.'
    },
    {
      id: 'research-requirements',
      title: 'Research Requirements',
      description: 'Understand admission requirements and prerequisites',
      content: 'Learn what you need to get accepted into your target programs.'
    },
    {
      id: 'prepare-applications',
      title: 'Prepare Applications',
      description: 'Work on essays, recommendations, and application materials',
      content: 'Get your application materials ready for submission.'
    },
    {
      id: 'submit-applications',
      title: 'Submit Applications',
      description: 'Complete and submit your program applications',
      content: 'Submit your applications and track their progress.'
    }
  ]
};
