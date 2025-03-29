
import { GuideStep } from '@/context/GuideContext';

const careerGuide: GuideStep[] = [
  {
    id: 'career-welcome',
    title: 'Career Explorer',
    description: 'Find your perfect career path with our exploration tools.',
    position: 'center',
    image: '/career-welcome.png'
  },
  {
    id: 'career-search',
    title: 'Search Careers',
    description: 'Find careers by title, skills, or keywords that interest you.',
    element: 'input[type="search"]',
    position: 'bottom',
    image: '/career-search.png'
  },
  {
    id: 'career-filters',
    title: 'Refine Results',
    description: 'Filter by industry, skills, and more to find your match.',
    element: '.CareerFilters',
    position: 'bottom',
    image: '/career-filters.png'
  },
  {
    id: 'career-results',
    title: 'Career Listings',
    description: 'Browse career cards with quick snapshots of each profession.',
    element: '.CareerResults',
    position: 'top',
    image: '/career-results.png'
  },
  {
    id: 'career-details',
    title: 'Career Details',
    description: 'See skills, education paths, and job outlook information.',
    position: 'center',
    image: '/career-details.png'
  },
  {
    id: 'career-related',
    title: 'Similar Careers',
    description: 'Discover related careers based on overlapping skills.',
    position: 'center',
    image: '/career-related.png'
  },
  {
    id: 'career-mentors',
    title: 'Field Experts',
    description: 'Connect with mentors who specialize in your chosen field.',
    position: 'center',
    image: '/career-mentors.png'
  },
  {
    id: 'career-complete',
    title: 'Ready to Explore',
    description: 'Start your career journey now!',
    position: 'center',
    image: '/career-complete.png'
  }
];

export default careerGuide;
