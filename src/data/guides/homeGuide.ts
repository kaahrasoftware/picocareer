
import { GuideStep } from '@/components/guide/types';

const homeGuide: GuideStep[] = [
  {
    id: 'home-welcome',
    title: 'Welcome to PicoCareer',
    description: 'Discover mentors, programs, and career opportunities on our platform.',
    position: 'center'
  },
  {
    id: 'home-search',
    title: 'Quick Search',
    description: 'Find mentors, programs, careers, and more with just a few clicks.',
    element: '.SearchBar',
    position: 'bottom',
    highlightColor: 'blue',
    demoAction: {
      type: 'scroll-to',
      target: '.SearchBar'
    }
  },
  {
    id: 'home-navigation',
    title: 'Main Navigation',
    description: 'Access Fields of Study, Careers, Mentors, and more from the menu.',
    element: 'nav',
    position: 'bottom',
    highlightColor: 'bright'
  },
  {
    id: 'home-featured-mentors',
    title: 'Top Mentors',
    description: 'Connect with highly-rated mentors in various professional fields.',
    element: '.TopRatedMentorsSection',
    position: 'top',
    highlightColor: 'blue',
    demoAction: {
      type: 'scroll-to',
      target: '.TopRatedMentorsSection'
    }
  },
  {
    id: 'home-featured-careers',
    title: 'Career Options',
    description: 'Explore careers that match your interests and skills.',
    element: '.FeaturedCareersSection',
    position: 'top',
    highlightColor: 'bright',
    demoAction: {
      type: 'scroll-to',
      target: '.FeaturedCareersSection'
    }
  },
  {
    id: 'home-auth',
    title: 'Sign In',
    description: 'Access personalized features by signing in or creating an account.',
    element: '.UserMenu',
    position: 'left',
    requiredAuth: false,
    highlightColor: 'blue',
    demoAction: {
      type: 'scroll-to',
      target: '.UserMenu'
    }
  },
  {
    id: 'home-complete',
    title: 'Start Exploring!',
    description: 'You\'re all set! Click the help button anytime to revisit this guide.',
    position: 'center'
  }
];

export default homeGuide;
