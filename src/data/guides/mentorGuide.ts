
import { GuideStep } from '@/context/GuideContext';

const mentorGuide: GuideStep[] = [
  {
    id: 'mentor-welcome',
    title: 'Mentor Page Guide',
    description: 'This guide will help you navigate the Mentor page, where you can find professionals ready to guide you in your career journey.',
    position: 'center'
  },
  {
    id: 'mentor-search',
    title: 'Search for Mentors',
    description: 'Use the search bar to find mentors by name, expertise, company, or specific skills. This helps you find the perfect match for your needs.',
    element: '.SearchInput',
    position: 'bottom'
  },
  {
    id: 'mentor-filters',
    title: 'Filter Mentors',
    description: 'Narrow down your search using various filters such as skills, location, company, or educational background. You can also filter by mentors who have available time slots.',
    element: '.CommunityFilters',
    position: 'bottom'
  },
  {
    id: 'mentor-grid',
    title: 'Browse Mentor Profiles',
    description: 'Scroll through mentor cards to see their expertise, ratings, and a quick overview. Click on any mentor card to view their detailed profile.',
    element: '.MentorGrid',
    position: 'top'
  },
  {
    id: 'mentor-profile',
    title: 'Mentor Profile Details',
    description: 'When you click on a mentor card, you\'ll see their detailed profile including their experience, education, skills, and availability for booking sessions.',
    position: 'center'
  },
  {
    id: 'mentor-booking',
    title: 'Book a Session',
    description: 'To book a mentoring session, you\'ll need to be signed in. Once logged in, you can view a mentor\'s availability and book a time slot that works for you.',
    position: 'center',
    requiredAuth: true
  },
  {
    id: 'mentor-become',
    title: 'Become a Mentor',
    description: 'If you\'re interested in sharing your expertise, you can apply to become a mentor by clicking the "Become a Mentor" button at the top of the page.',
    element: 'a[href="/mentor-registration"]',
    position: 'bottom'
  },
  {
    id: 'mentor-complete',
    title: 'Explore and Connect',
    description: 'You\'ve completed the Mentor page tour! Start exploring mentors in your field of interest and reach out to them for guidance on your career journey.',
    position: 'center'
  }
];

export default mentorGuide;
