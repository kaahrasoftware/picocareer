
import { Guide } from '@/context/GuideContext';

export const careerGuide: Guide = {
  id: 'career-exploration',
  title: 'Career Exploration Guide',
  description: 'Discover and explore career paths that match your interests and goals',
  steps: [
    {
      id: 'browse-careers',
      title: 'Browse Career Options',
      description: 'Explore different career paths and learn about various professions',
      content: 'Browse through our extensive database of career options to find what interests you.'
    },
    {
      id: 'career-assessment',
      title: 'Take Career Assessment',
      description: 'Complete assessments to identify careers that match your skills and interests',
      content: 'Take our AI-powered career assessment to get personalized recommendations.'
    },
    {
      id: 'research-requirements',
      title: 'Research Career Requirements',
      description: 'Learn about education, skills, and experience needed for your target careers',
      content: 'Understand what it takes to succeed in your chosen career paths.'
    },
    {
      id: 'connect-mentors',
      title: 'Connect with Mentors',
      description: 'Find and connect with professionals in your fields of interest',
      content: 'Connect with experienced professionals who can guide your career journey.'
    }
  ]
};
