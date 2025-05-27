
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
  targetRect: DOMRect,
  containerRect: DOMRect,
  preferredPosition: TooltipPosition = "right"
): TooltipPosition {
  return calculatePosition(targetRect, containerRect, preferredPosition);
}
