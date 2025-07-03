
import { Guide } from '@/context/GuideContext';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const profileGuide: Guide = {
  id: 'profile-setup',
  title: 'Profile Setup Guide',
  description: 'Complete your profile to get the most out of PicoCareer',
  steps: [
    {
      id: 'basic-info',
      title: 'Add Basic Information',
      description: 'Complete your name, bio, and contact information',
      completed: false
    },
    {
      id: 'academic-background',
      title: 'Academic Background',
      description: 'Add your education history and academic achievements',
      completed: false
    },
    {
      id: 'career-interests',
      title: 'Career Interests',
      description: 'Specify your career interests and goals',
      completed: false
    },
    {
      id: 'profile-photo',
      title: 'Upload Profile Photo',
      description: 'Add a professional profile photo',
      completed: false
    }
  ]
};
