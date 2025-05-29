
import { useState, useEffect } from 'react';

export interface Breakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
  width: number;
}

export function useBreakpoints(): Breakpoints {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024 && width < 1440;
  const isLargeDesktop = width >= 1440;

  let currentBreakpoint: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
  if (isMobile) currentBreakpoint = 'mobile';
  else if (isTablet) currentBreakpoint = 'tablet';
  else if (isDesktop) currentBreakpoint = 'desktop';
  else currentBreakpoint = 'large-desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentBreakpoint,
    width,
  };
}
