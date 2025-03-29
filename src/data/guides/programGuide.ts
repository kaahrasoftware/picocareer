
import { GuideStep } from '@/context/GuideContext';

const programGuide: GuideStep[] = [
  {
    id: 'program-welcome',
    title: 'Academic Programs Guide',
    description: 'This guide will help you navigate the academic programs available on PicoCareer.',
    position: 'center'
  },
  {
    id: 'program-search',
    title: 'Search Programs',
    description: 'Use the search functionality to find specific academic programs by name, field, or keywords.',
    element: 'input[type="search"]',
    position: 'bottom'
  },
  {
    id: 'program-filters',
    title: 'Filter Programs',
    description: 'Narrow down your options using filters like discipline, degree level, and duration to find programs that match your educational goals.',
    position: 'bottom'
  },
  {
    id: 'program-browse',
    title: 'Browse Program Cards',
    description: 'Scroll through program cards to see a brief overview of different academic offerings. Each card provides key information about the program.',
    position: 'top'
  },
  {
    id: 'program-details',
    title: 'View Program Details',
    description: 'Click on any program card to see detailed information including curriculum, requirements, career outcomes, and more.',
    position: 'center'
  },
  {
    id: 'program-related',
    title: 'Explore Related Programs',
    description: 'When viewing a program, you\'ll also see related or similar programs that might interest you based on field of study or career path.',
    position: 'center'
  },
  {
    id: 'program-complete',
    title: 'Discover Your Educational Path',
    description: 'You\'ve completed the Academic Programs tour! Start exploring programs that match your interests and career goals.',
    position: 'center'
  }
];

export default programGuide;
