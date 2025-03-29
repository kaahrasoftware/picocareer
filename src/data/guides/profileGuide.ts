
import { GuideStep } from '@/context/GuideContext';

const profileGuide: GuideStep[] = [
  {
    id: 'profile-welcome',
    title: 'Your Profile',
    description: 'Make the most of your PicoCareer account with this guide.',
    position: 'center',
    requiredAuth: true,
    image: '/profile-welcome.png'
  },
  {
    id: 'profile-overview',
    title: 'Profile Overview',
    description: 'This is how others see you on the platform.',
    position: 'top',
    requiredAuth: true,
    image: '/profile-overview.png'
  },
  {
    id: 'profile-edit',
    title: 'Edit Profile',
    description: 'Update your info using the edit buttons in each section.',
    position: 'right',
    requiredAuth: true,
    image: '/profile-edit.png'
  },
  {
    id: 'profile-tabs',
    title: 'Profile Sections',
    description: 'Navigate between dashboard, bookmarks, sessions, and settings.',
    element: '.ProfileTabs',
    position: 'bottom',
    requiredAuth: true,
    image: '/profile-tabs.png'
  },
  {
    id: 'profile-bookmarks',
    title: 'Saved Items',
    description: 'Access careers, programs, and mentors you\'ve bookmarked.',
    position: 'center',
    requiredAuth: true,
    image: '/profile-bookmarks.png'
  },
  {
    id: 'profile-sessions',
    title: 'Your Sessions',
    description: 'View, reschedule, or cancel upcoming mentoring sessions.',
    position: 'center',
    requiredAuth: true,
    image: '/profile-sessions.png'
  },
  {
    id: 'profile-settings',
    title: 'Account Settings',
    description: 'Manage notifications, privacy, and connected accounts.',
    position: 'center',
    requiredAuth: true,
    image: '/profile-settings.png'
  },
  {
    id: 'profile-complete',
    title: 'All Set!',
    description: 'Keep your profile updated for better recommendations.',
    position: 'center',
    requiredAuth: true,
    image: '/profile-complete.png'
  }
];

export default profileGuide;
