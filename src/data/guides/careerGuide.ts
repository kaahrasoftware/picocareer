
import { GuideStep } from '@/context/GuideContext';

const careerGuide: GuideStep[] = [
  {
    id: 'career-welcome',
    title: 'Career Exploration Guide',
    description: 'This guide will help you navigate through our career exploration tools and resources.',
    position: 'center'
  },
  {
    id: 'career-search',
    title: 'Search Careers',
    description: 'Use the search bar to find specific careers by title, skills, or keywords. This helps you discover careers that match your interests and abilities.',
    element: 'input[type="search"]',
    position: 'bottom'
  },
  {
    id: 'career-filters',
    title: 'Filter Career Options',
    description: 'Narrow down your options using filters like industry, required skills, and popularity. This helps you focus on careers that match your specific criteria.',
    element: '.CareerFilters',
    position: 'bottom'
  },
  {
    id: 'career-results',
    title: 'Browse Career Cards',
    description: 'Scroll through career cards to see a brief overview of different professions. Each card provides a quick snapshot of what the career entails.',
    element: '.CareerResults',
    position: 'top'
  },
  {
    id: 'career-details',
    title: 'View Career Details',
    description: 'Click on any career card to see detailed information including required skills, education paths, job outlook, and more.',
    position: 'center'
  },
  {
    id: 'career-related',
    title: 'Explore Related Careers',
    description: 'When viewing a career, you\'ll also see related or similar careers that might interest you based on overlapping skills or industry.',
    position: 'center'
  },
  {
    id: 'career-mentors',
    title: 'Find Mentors in this Field',
    description: 'For each career, you can find mentors who specialize in that field and can provide guidance based on their professional experience.',
    position: 'center'
  },
  {
    id: 'career-complete',
    title: 'Start Your Career Exploration',
    description: 'You\'ve completed the Career page tour! Start exploring careers that match your interests and skills, and learn what you need to succeed in those fields.',
    position: 'center'
  }
];

export default careerGuide;
