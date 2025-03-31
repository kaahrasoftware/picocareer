
import { GuideStep } from '@/context/GuideContext';

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
    element: '.main-content .SearchBar',
    position: 'bottom',
    highlightColor: 'gold',
    demoAction: {
      type: 'scroll-to',
      target: '.main-content .SearchBar'
    }
  },
  {
    id: 'home-navigation',
    title: 'Main Navigation',
    description: 'Access Fields of Study, Careers, Mentors, and more from the menu.',
    element: 'nav',
    position: 'bottom',
    highlightColor: 'green'
  },
  {
    id: 'home-featured-mentors',
    title: 'Top Mentors',
    description: 'Connect with highly-rated mentors in various professional fields.',
    element: '.TopRatedMentorsSection',
    position: 'top',
    highlightColor: 'gold',
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
    highlightColor: 'green',
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
    highlightColor: 'gold'
  },
  {
    id: 'home-complete',
    title: 'Start Exploring!',
    description: 'You\'re all set! Click the help button anytime to revisit this guide.',
    position: 'center'
  }
];

export default homeGuide;
