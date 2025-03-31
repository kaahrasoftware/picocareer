
export const isElementInViewport = (el: Element): boolean => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export const calculateDialogPosition = (
  targetElement: Element | null,
  dialogElement: HTMLDivElement | null,
  position: 'top' | 'right' | 'bottom' | 'left' | 'center'
) => {
  // Default positions
  let dialogPosition = {
    top: window.innerHeight / 2 - 150,
    left: window.innerWidth / 2 - 175,
  };
  
  let arrowPosition = { 
    top: 0, 
    left: 0, 
    rotation: 0 
  };
  
  let guideArrowPosition = { 
    top: 0, 
    left: 0, 
    direction: 'right' as const
  };

  if (!targetElement || !dialogElement || position === 'center') {
    return { dialogPosition, arrowPosition, guideArrowPosition };
  }

  const targetRect = targetElement.getBoundingClientRect();
  const dialogRect = dialogElement.getBoundingClientRect();
  
  // Calculate positions for dialog and connector
  let top = 0;
  let left = 0;
  let arrowTop = 0;
  let arrowLeft = 0;
  let rotation = 0;
  let arrowDirection = 'right' as const;
  let arrowLeft2 = 0;
  let arrowTop2 = 0;

  // Position based on preference, with bounds checking
  switch (position) {
    case 'top':
      top = targetRect.top - dialogRect.height - 20;
      left = targetRect.left + (targetRect.width / 2) - (dialogRect.width / 2);
      arrowTop = dialogRect.height;
      arrowLeft = dialogRect.width / 2;
      rotation = 180;
      arrowDirection = 'bottom';
      arrowLeft2 = targetRect.left + targetRect.width / 2 - 20;
      arrowTop2 = targetRect.top - 50;
      break;
    case 'bottom':
      top = targetRect.bottom + 20;
      left = targetRect.left + (targetRect.width / 2) - (dialogRect.width / 2);
      arrowTop = -10;
      arrowLeft = dialogRect.width / 2;
      rotation = 0;
      arrowDirection = 'top';
      arrowLeft2 = targetRect.left + targetRect.width / 2 - 20;
      arrowTop2 = targetRect.bottom + 10;
      break;
    case 'left':
      top = targetRect.top + (targetRect.height / 2) - (dialogRect.height / 2);
      left = targetRect.left - dialogRect.width - 20;
      arrowTop = dialogRect.height / 2;
      arrowLeft = dialogRect.width;
      rotation = 90;
      arrowDirection = 'right';
      arrowLeft2 = targetRect.left - 50;
      arrowTop2 = targetRect.top + targetRect.height / 2 - 20;
      break;
    case 'right':
      top = targetRect.top + (targetRect.height / 2) - (dialogRect.height / 2);
      left = targetRect.right + 20;
      arrowTop = dialogRect.height / 2;
      arrowLeft = -10;
      rotation = 270;
      arrowDirection = 'left';
      arrowLeft2 = targetRect.right + 10;
      arrowTop2 = targetRect.top + targetRect.height / 2 - 20;
      break;
    default:
      top = targetRect.bottom + 20;
      left = targetRect.left + (targetRect.width / 2) - (dialogRect.width / 2);
      arrowTop = -10;
      arrowLeft = dialogRect.width / 2;
      rotation = 0;
      arrowDirection = 'top';
      arrowLeft2 = targetRect.left + targetRect.width / 2 - 20;
      arrowTop2 = targetRect.bottom + 10;
  }
  
  // Ensure dialog stays within viewport
  if (left < 20) left = 20;
  if (left + dialogRect.width > window.innerWidth - 20) {
    left = window.innerWidth - dialogRect.width - 20;
  }
  
  if (top < 20) top = 20;
  if (top + dialogRect.height > window.innerHeight - 20) {
    top = window.innerHeight - dialogRect.height - 20;
  }
  
  dialogPosition = { top, left };
  arrowPosition = { top: arrowTop, left: arrowLeft, rotation };
  guideArrowPosition = { 
    top: arrowTop2, 
    left: arrowLeft2,
    direction: arrowDirection
  };
  
  return { dialogPosition, arrowPosition, guideArrowPosition };
};
