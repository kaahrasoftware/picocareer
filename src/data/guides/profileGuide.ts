
import { GuideStep } from '@/context/GuideContext';

const profileGuide: GuideStep[] = [
  {
    id: 'profile-welcome',
    title: 'Your Profile Guide',
    description: 'This guide will help you navigate your profile page and understand how to make the most of your PicoCareer account.',
    position: 'center',
    requiredAuth: true
  },
  {
    id: 'profile-overview',
    title: 'Profile Overview',
    description: 'Your profile displays your personal information, expertise, and activity on the platform. This is how others will see you on PicoCareer.',
    position: 'top',
    requiredAuth: true
  },
  {
    id: 'profile-edit',
    title: 'Edit Your Profile',
    description: 'You can update your profile information including your name, bio, skills, and profile picture by clicking the edit buttons next to each section.',
    position: 'right',
    requiredAuth: true
  },
  {
    id: 'profile-tabs',
    title: 'Profile Tabs',
    description: 'Navigate between different sections of your profile like your dashboard, bookmarked content, scheduled sessions, and settings.',
    element: '.ProfileTabs',
    position: 'bottom',
    requiredAuth: true
  },
  {
    id: 'profile-bookmarks',
    title: 'Your Bookmarks',
    description: 'View all the careers, programs, and mentors you\'ve bookmarked for future reference. This helps you keep track of options you\'re interested in.',
    position: 'center',
    requiredAuth: true
  },
  {
    id: 'profile-sessions',
    title: 'Mentoring Sessions',
    description: 'View your upcoming and past mentoring sessions. You can reschedule or cancel upcoming sessions if needed.',
    position: 'center',
    requiredAuth: true
  },
  {
    id: 'profile-settings',
    title: 'Account Settings',
    description: 'Manage your account settings including notification preferences, privacy options, and connected accounts.',
    position: 'center',
    requiredAuth: true
  },
  {
    id: 'profile-complete',
    title: 'Make the Most of Your Profile',
    description: 'You\'ve completed the Profile tour! Keep your profile updated to get the most relevant recommendations and to present yourself professionally to mentors and peers.',
    position: 'center',
    requiredAuth: true
  }
];

export default profileGuide;
