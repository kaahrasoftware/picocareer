
import { GuideStep } from '@/context/GuideContext';

const mentorGuide: GuideStep[] = [
  {
    id: 'mentor-welcome',
    title: 'Welcome to Mentors',
    description: 'Find professionals who can guide you in your career journey.',
    position: 'center'
  },
  {
    id: 'mentor-search',
    title: 'Search for Mentors',
    description: 'Find mentors by name, expertise, company, or skills.',
    element: '.SearchInput',
    position: 'bottom',
    highlightColor: 'gold'
  },
  {
    id: 'mentor-filters',
    title: 'Filter Mentors',
    description: 'Narrow down by skills, location, company, or availability.',
    element: '.CommunityFilters',
    position: 'bottom',
    highlightColor: 'green',
    demoAction: {
      type: 'scroll-to',
      target: '.CommunityFilters'
    }
  },
  {
    id: 'mentor-grid',
    title: 'Browse Mentor Profiles',
    description: 'See mentor expertise, ratings, and overview at a glance.',
    element: '.MentorGrid',
    position: 'top',
    highlightColor: 'gold',
    demoAction: {
      type: 'scroll-to',
      target: '.MentorGrid'
    }
  },
  {
    id: 'mentor-profile',
    title: 'View Detailed Profile',
    description: 'Check experience, education, skills, and session availability.',
    position: 'center',
    demoAction: {
      type: 'open-dialog',
      target: 'mentor-profile',
      data: { id: 'raf97.to@gmail.com' }
    }
  },
  {
    id: 'mentor-booking',
    title: 'Book a Session',
    description: 'Sign in to view availability and book a mentoring session.',
    position: 'center',
    requiredAuth: true
  },
  {
    id: 'mentor-become',
    title: 'Become a Mentor',
    description: 'Share your expertise by applying to be a mentor.',
    element: 'a[href="/mentor-registration"]',
    position: 'bottom',
    highlightColor: 'green'
  },
  {
    id: 'mentor-complete',
    title: 'Ready to Connect',
    description: 'Start exploring mentors in your field of interest!',
    position: 'center'
  }
];

export default mentorGuide;
