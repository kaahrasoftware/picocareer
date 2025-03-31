
import { GuideStep } from '../types';

// Import the guides data based on the path
export const getGuideForPath = async (path: string): Promise<GuideStep[]> => {
  try {
    // Dynamic import based on the path
    let guideModule;
    
    switch (path) {
      case '/':
        guideModule = await import('@/data/guides/homeGuide');
        break;
      case '/mentor':
        guideModule = await import('@/data/guides/mentorGuide');
        break;
      case '/career':
        guideModule = await import('@/data/guides/careerGuide');
        break;
      case '/program':
        guideModule = await import('@/data/guides/programGuide');
        break;
      case '/profile':
        guideModule = await import('@/data/guides/profileGuide');
        break;
      default:
        guideModule = await import('@/data/guides/homeGuide');
    }
    
    return guideModule.default;
  } catch (error) {
    console.error('Error loading guide data:', error);
    return [];
  }
};
