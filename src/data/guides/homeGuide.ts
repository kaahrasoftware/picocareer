
import { GuideStep } from '@/context/GuideContext';

const homeGuide: GuideStep[] = [
  {
    id: 'home-welcome',
    title: 'Welcome to PicoCareer',
    description: 'Discover mentors, programs, and career opportunities on our platform.',
    position: 'center',
    image: '/home-welcome.png'
  },
  {
    id: 'home-search',
    title: 'Quick Search',
    description: 'Find mentors, programs, careers, and more with just a few clicks.',
    element: '.main-content .SearchBar',
    position: 'bottom',
    image: '/home-search.png'
  },
  {
    id: 'home-navigation',
    title: 'Main Navigation',
    description: 'Access Fields of Study, Careers, Mentors, and more from the menu.',
    element: 'nav',
    position: 'bottom',
    image: '/home-nav.png'
  },
  {
    id: 'home-featured-mentors',
    title: 'Top Mentors',
    description: 'Connect with highly-rated mentors in various professional fields.',
    element: '.TopRatedMentorsSection',
    position: 'top',
    image: '/home-mentors.png'
  },
  {
    id: 'home-featured-careers',
    title: 'Career Options',
    description: 'Explore careers that match your interests and skills.',
    element: '.FeaturedCareersSection',
    position: 'top',
    image: '/home-careers.png'
  },
  {
    id: 'home-auth',
    title: 'Sign In',
    description: 'Access personalized features by signing in or creating an account.',
    element: '.UserMenu',
    position: 'left',
    requiredAuth: false,
    image: '/home-signin.png'
  },
  {
    id: 'home-complete',
    title: 'Start Exploring!',
    description: 'You\'re all set! Click the help button anytime to revisit this guide.',
    position: 'center',
    image: '/home-complete.png'
  }
];

export default homeGuide;
