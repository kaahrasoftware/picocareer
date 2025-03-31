
import { GuideStep } from '../types';
import { NavigateFunction } from 'react-router-dom';

export const executeDemoAction = (
  step: GuideStep,
  navigate: NavigateFunction
): void => {
  if (!step.demoAction) return;
  
  const { type, target, data } = step.demoAction;
  
  // Execute the appropriate demo action
  switch (type) {
    case 'open-dialog':
      // Implementation for opening specific dialogs
      console.log('Opening dialog:', target);
      // Example: For mentor profile, we could trigger a click on a specific mentor card
      if (target === 'mentor-profile' && data?.id) {
        const mentorButton = document.querySelector(`[data-mentor-id="${data.id}"]`);
        if (mentorButton) {
          (mentorButton as HTMLElement).click();
        }
      }
      break;
      
    case 'navigate':
      // Navigate to a specific route
      if (target && window.location.pathname !== target) {
        navigate(target);
      }
      break;
      
    case 'scroll-to':
      // Scroll to a specific element
      setTimeout(() => {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      break;
  }
};
