
import { Guide } from '@/context/GuideContext';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const programGuide: Guide = {
  id: 'program-search',
  title: 'Program Search Guide',
  description: 'Find and apply to academic programs that match your goals',
  steps: [
    {
      id: 'explore-programs',
      title: 'Explore Academic Programs',
      description: 'Browse universities and programs in your field of interest',
      completed: false
    },
    {
      id: 'research-requirements',
      title: 'Research Requirements',
      description: 'Understand admission requirements and prerequisites',
      completed: false
    },
    {
      id: 'prepare-applications',
      title: 'Prepare Applications',
      description: 'Work on essays, recommendations, and application materials',
      completed: false
    },
    {
      id: 'submit-applications',
      title: 'Submit Applications',
      description: 'Complete and submit your program applications',
      completed: false
    }
  ]
};
