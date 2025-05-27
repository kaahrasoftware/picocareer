
export type TooltipPosition = "top" | "bottom" | "left" | "right";

export function calculatePosition(
  targetRect: DOMRect,
  containerRect: DOMRect,
  preferredPosition: TooltipPosition = "right"
): TooltipPosition {
  const padding = 16;
  const tooltipWidth = 300;
  const tooltipHeight = 200;

  // Check available space in each direction
  const spaceTop = targetRect.top - containerRect.top;
  const spaceBottom = containerRect.bottom - targetRect.bottom;
  const spaceLeft = targetRect.left - containerRect.left;
  const spaceRight = containerRect.right - targetRect.right;

  // Determine best position based on available space
  switch (preferredPosition) {
    case "top":
      if (spaceTop >= tooltipHeight + padding) {
        return "top";
      }
      break;
    case "bottom":
      if (spaceBottom >= tooltipHeight + padding) {
        return "bottom";
      }
      break;
    case "left":
      if (spaceLeft >= tooltipWidth + padding) {
        return "left";
      }
      break;
    case "right":
      if (spaceRight >= tooltipWidth + padding) {
        return "right";
      }
      break;
  }

  // Fallback logic - find the position with most space
  const spaces = [
    { position: "top" as const, space: spaceTop },
    { position: "bottom" as const, space: spaceBottom },
    { position: "left" as const, space: spaceLeft },
    { position: "right" as const, space: spaceRight },
  ];

  const bestPosition = spaces.reduce((prev, current) => 
    current.space > prev.space ? current : prev
  );

  return bestPosition.position;
}

export function getPositionStyles(
  position: TooltipPosition,
  targetRect: DOMRect,
  containerRect: DOMRect
) {
  const offset = 12;
  
  switch (position) {
    case "top":
      return {
        bottom: containerRect.height - targetRect.top + offset,
        left: targetRect.left + targetRect.width / 2,
        transform: "translateX(-50%)",
      };
    case "bottom":
      return {
        top: targetRect.bottom + offset,
        left: targetRect.left + targetRect.width / 2,
        transform: "translateX(-50%)",
      };
    case "left":
      return {
        top: targetRect.top + targetRect.height / 2,
        right: containerRect.width - targetRect.left + offset,
        transform: "translateY(-50%)",
      };
    case "right":
      return {
        top: targetRect.top + targetRect.height / 2,
        left: targetRect.right + offset,
        transform: "translateY(-50%)",
      };
    default:
      return {};
  }
}

export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function calculateDialogPosition(
  targetElement: HTMLElement,
  dialogElement: HTMLElement,
  preferredPosition: TooltipPosition = "right"
): {
  dialogPosition: { top: number; left: number };
  arrowPosition: { top: number; left: number; rotation: number };
  guideArrowPosition: { top: number; left: number; direction: TooltipPosition };
} {
  const targetRect = targetElement.getBoundingClientRect();
  const dialogRect = dialogElement.getBoundingClientRect();
  const containerRect = document.body.getBoundingClientRect();
  
  const position = calculatePosition(targetRect, containerRect, preferredPosition);
  
  // Calculate dialog position
  const dialogPosition = { top: 0, left: 0 };
  switch (position) {
    case "top":
      dialogPosition.top = targetRect.top - dialogRect.height - 12;
      dialogPosition.left = targetRect.left + (targetRect.width - dialogRect.width) / 2;
      break;
    case "bottom":
      dialogPosition.top = targetRect.bottom + 12;
      dialogPosition.left = targetRect.left + (targetRect.width - dialogRect.width) / 2;
      break;
    case "left":
      dialogPosition.top = targetRect.top + (targetRect.height - dialogRect.height) / 2;
      dialogPosition.left = targetRect.left - dialogRect.width - 12;
      break;
    case "right":
      dialogPosition.top = targetRect.top + (targetRect.height - dialogRect.height) / 2;
      dialogPosition.left = targetRect.right + 12;
      break;
  }
  
  return {
    dialogPosition,
    arrowPosition: { top: 0, left: 0, rotation: 0 },
    guideArrowPosition: { top: targetRect.top, left: targetRect.left, direction: position }
  };
}
