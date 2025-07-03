
import { Guide } from '@/context/GuideContext';

export const profileGuide: Guide = {
  id: 'profile-setup',
  title: 'Profile Setup Guide',
  description: 'Complete your profile to get the most out of PicoCareer',
  steps: [
    {
      id: 'basic-info',
      title: 'Add Basic Information',
      description: 'Complete your name, bio, and contact information',
      content: 'Start by filling out your basic information to help others understand who you are.'
    },
    {
      id: 'academic-background',
      title: 'Academic Background',
      description: 'Add your education history and academic achievements',
      content: 'Add your educational background to showcase your academic journey.'
    },
    {
      id: 'career-interests',
      title: 'Career Interests',
      description: 'Specify your career interests and goals',
      content: 'Let others know what career paths interest you most.'
    },
    {
      id: 'profile-photo',
      title: 'Upload Profile Photo',
      description: 'Add a professional profile photo',
      content: 'A professional photo helps build trust and makes your profile more engaging.'
    }
  ]
};
