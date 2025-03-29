
import { GuideStep } from '@/context/GuideContext';

const homeGuide: GuideStep[] = [
  {
    id: 'home-welcome',
    title: 'Welcome to PicoCareer',
    description: 'This guide will help you discover the key features of PicoCareer. Let us show you around our platform that connects you with mentors, educational programs, and career opportunities.',
    position: 'center'
  },
  {
    id: 'home-search',
    title: 'Search Functionality',
    description: 'Use the search bar to find mentors, academic programs, careers, universities, and scholarships. Simply type what you\'re looking for and see relevant results instantly.',
    element: '.main-content .SearchBar',
    position: 'bottom'
  },
  {
    id: 'home-navigation',
    title: 'Navigation Menu',
    description: 'The navigation menu provides quick access to various sections of the platform. Explore Fields of Study, Careers, Mentors, and more from here.',
    element: 'nav',
    position: 'bottom'
  },
  {
    id: 'home-featured-mentors',
    title: 'Featured Mentors',
    description: 'Discover our top-rated mentors in various fields. These professionals are ready to guide you through your career journey with their expertise and experience.',
    element: '.TopRatedMentorsSection',
    position: 'top'
  },
  {
    id: 'home-featured-careers',
    title: 'Featured Careers',
    description: 'Explore highlighted career paths that might interest you. Click on any career card to learn more about the requirements, prospects, and details.',
    element: '.FeaturedCareersSection',
    position: 'top'
  },
  {
    id: 'home-auth',
    title: 'Sign In or Create an Account',
    description: 'To access personalized features like bookmarking, profile building, and session booking, you\'ll need to sign in or create an account.',
    element: '.UserMenu',
    position: 'left',
    requiredAuth: false
  },
  {
    id: 'home-complete',
    title: 'You\'re Ready to Explore!',
    description: 'You\'ve completed the home page tour. Feel free to explore the platform and discover opportunities that match your interests and goals. Remember, you can access this guide anytime by clicking the Help button in the navigation bar.',
    position: 'center'
  }
];

export default homeGuide;
