
import { Guide } from '@/context/GuideContext';

export const mentorGuide: Guide = {
  id: 'mentor-setup',
  title: 'Mentor Setup Guide',
  description: 'Set up your mentor profile and start helping students',
  steps: [
    {
      id: 'complete-profile',
      title: 'Complete Your Profile',
      description: 'Add your background, expertise, and experience details',
      content: 'Fill out your professional background to attract the right mentees.'
    },
    {
      id: 'set-availability',
      title: 'Set Your Availability',
      description: 'Configure your schedule and available time slots',
      content: 'Set up your availability so students can book sessions with you.'
    },
    {
      id: 'define-services',
      title: 'Define Your Services',
      description: 'Set up the types of mentoring sessions you offer',
      content: 'Create different types of sessions you can offer to mentees.'
    },
    {
      id: 'first-session',
      title: 'Book Your First Session',
      description: 'Start mentoring by booking your first session with a student',
      content: 'Once everything is set up, you can start accepting session requests.'
    }
  ]
};
