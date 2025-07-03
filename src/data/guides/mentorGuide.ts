
import { Guide } from '@/context/GuideContext';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const mentorGuide: Guide = {
  id: 'mentor-setup',
  title: 'Mentor Setup Guide',
  description: 'Set up your mentor profile and start helping students',
  steps: [
    {
      id: 'complete-profile',
      title: 'Complete Your Profile',
      description: 'Add your background, expertise, and experience details',
      completed: false
    },
    {
      id: 'set-availability',
      title: 'Set Your Availability',
      description: 'Configure your schedule and available time slots',
      completed: false
    },
    {
      id: 'define-services',
      title: 'Define Your Services',
      description: 'Set up the types of mentoring sessions you offer',
      completed: false
    },
    {
      id: 'first-session',
      title: 'Book Your First Session',
      description: 'Start mentoring by booking your first session with a student',
      completed: false
    }
  ]
};
