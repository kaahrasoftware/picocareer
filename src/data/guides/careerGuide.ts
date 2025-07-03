
import { Guide } from '@/context/GuideContext';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const careerGuide: Guide = {
  id: 'career-exploration',
  title: 'Career Exploration Guide',
  description: 'Discover and explore career paths that match your interests and goals',
  steps: [
    {
      id: 'browse-careers',
      title: 'Browse Career Options',
      description: 'Explore different career paths and learn about various professions',
      completed: false
    },
    {
      id: 'career-assessment',
      title: 'Take Career Assessment',
      description: 'Complete assessments to identify careers that match your skills and interests',
      completed: false
    },
    {
      id: 'research-requirements',
      title: 'Research Career Requirements',
      description: 'Learn about education, skills, and experience needed for your target careers',
      completed: false
    },
    {
      id: 'connect-mentors',
      title: 'Connect with Mentors',
      description: 'Find and connect with professionals in your fields of interest',
      completed: false
    }
  ]
};
