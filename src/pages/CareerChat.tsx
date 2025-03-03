
import React, { useEffect } from 'react';
import PicoChat from '@/components/career-chat/PicoChat';

export default function CareerChat() {
  // Set dark mode on component mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);
  
  return <PicoChat />;
}
