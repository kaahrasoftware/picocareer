
import React, { useEffect } from 'react';
import PicoChat from '@/components/career-chat/PicoChat';

export default function CareerChat() {
  // Remove dark mode setting on component mount
  useEffect(() => {
    // Ensure light mode by removing dark class if it exists
    document.documentElement.classList.remove('dark');
    
    // No cleanup needed since we're not adding any classes
  }, []);
  
  return <PicoChat />;
}
