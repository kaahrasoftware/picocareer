
import { GuideStep } from '@/context/GuideContext';

const programGuide: GuideStep[] = [
  {
    id: 'program-welcome',
    title: 'Academic Programs',
    description: 'Discover programs that match your career goals.',
    position: 'center'
  },
  {
    id: 'program-search',
    title: 'Find Programs',
    description: 'Search by name, field, or keywords to find your ideal program.',
    element: 'input[type="search"]',
    position: 'bottom',
    highlightColor: 'gold'
  },
  {
    id: 'program-filters',
    title: 'Filter Options',
    description: 'Narrow by discipline, degree level, and duration.',
    element: '.ProgramFilters',
    position: 'bottom',
    highlightColor: 'green',
    demoAction: {
      type: 'scroll-to',
      target: '.CommunityFilters'
    }
  },
  {
    id: 'program-browse',
    title: 'Program Cards',
    description: 'View key information about each academic offering.',
    element: '.ProgramGrid',
    position: 'top',
    highlightColor: 'gold',
    demoAction: {
      type: 'scroll-to',
      target: '.grid'
    }
  },
  {
    id: 'program-details',
    title: 'Program Details',
    description: 'Explore curriculum, requirements, and career outcomes.',
    position: 'center',
    demoAction: {
      type: 'open-dialog',
      target: 'program-details',
      data: { id: '1' }  // Show details for a specific program
    }
  },
  {
    id: 'program-related',
    title: 'Similar Programs',
    description: 'Discover related options based on field or career path.',
    position: 'center'
  },
  {
    id: 'program-complete',
    title: 'Your Educational Path',
    description: 'Ready to find programs that match your goals!',
    position: 'center'
  }
];

export default programGuide;
