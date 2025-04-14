
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteChangeHandler() {
  const location = useLocation();

  useEffect(() => {
    // Log route changes or perform any necessary actions
    console.log('Current route:', location.pathname);
  }, [location]);

  return null;
}
