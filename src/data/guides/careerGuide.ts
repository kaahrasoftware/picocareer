
import { GuideStep } from '@/context/GuideContext';

const careerGuide: GuideStep[] = [
  {
    id: 'career-welcome',
    title: 'Career Explorer',
    description: 'Find your perfect career path with our exploration tools.',
    position: 'center'
  },
  {
    id: 'career-search',
    title: 'Search Careers',
    description: 'Find careers by title, skills, or keywords that interest you.',
    element: 'input[type="search"]',
    position: 'bottom',
    highlightColor: 'gold'
  },
  {
    id: 'career-filters',
    title: 'Refine Results',
    description: 'Filter by industry, skills, and more to find your match.',
    element: '.CareerFilters',
    position: 'bottom',
    highlightColor: 'green',
    demoAction: {
      type: 'scroll-to',
      target: '.CareerFilters'
    }
  },
  {
    id: 'career-results',
    title: 'Career Listings',
    description: 'Browse career cards with quick snapshots of each profession.',
    element: '.CareerResults',
    position: 'top',
    highlightColor: 'gold',
    demoAction: {
      type: 'scroll-to',
      target: '.CareerResults'
    }
  },
  {
    id: 'career-details',
    title: 'Career Details',
    description: 'See skills, education paths, and job outlook information.',
    position: 'center',
    demoAction: {
      type: 'open-dialog',
      target: 'career-details',
      data: { id: '1' }  // Show details for a specific career
    }
  },
  {
    id: 'career-related',
    title: 'Similar Careers',
    description: 'Discover related careers based on overlapping skills.',
    position: 'center'
  },
  {
    id: 'career-mentors',
    title: 'Field Experts',
    description: 'Connect with mentors who specialize in your chosen field.',
    position: 'center'
  },
  {
    id: 'career-complete',
    title: 'Ready to Explore',
    description: 'Start your career journey now!',
    position: 'center'
  }
];

export default careerGuide;
