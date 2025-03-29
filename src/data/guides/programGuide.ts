
import { GuideStep } from '@/context/GuideContext';

const programGuide: GuideStep[] = [
  {
    id: 'program-welcome',
    title: 'Academic Programs',
    description: 'Discover programs that match your career goals.',
    position: 'center',
    image: '/program-welcome.png'
  },
  {
    id: 'program-search',
    title: 'Find Programs',
    description: 'Search by name, field, or keywords to find your ideal program.',
    element: 'input[type="search"]',
    position: 'bottom',
    image: '/program-search.png'
  },
  {
    id: 'program-filters',
    title: 'Filter Options',
    description: 'Narrow by discipline, degree level, and duration.',
    position: 'bottom',
    image: '/program-filters.png'
  },
  {
    id: 'program-browse',
    title: 'Program Cards',
    description: 'View key information about each academic offering.',
    position: 'top',
    image: '/program-browse.png'
  },
  {
    id: 'program-details',
    title: 'Program Details',
    description: 'Explore curriculum, requirements, and career outcomes.',
    position: 'center',
    image: '/program-details.png'
  },
  {
    id: 'program-related',
    title: 'Similar Programs',
    description: 'Discover related options based on field or career path.',
    position: 'center',
    image: '/program-related.png'
  },
  {
    id: 'program-complete',
    title: 'Your Educational Path',
    description: 'Ready to find programs that match your goals!',
    position: 'center',
    image: '/program-complete.png'
  }
];

export default programGuide;
