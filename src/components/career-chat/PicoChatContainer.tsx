
import React from 'react';
import { PicoChat } from './PicoChat';
import { useAuthSession } from '@/hooks/useAuthSession';

export const PicoChatContainer = () => {
  const { session, user, isLoading } = useAuthSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isAuthenticated = !!session;

  return (
    <div className="h-full">
      <PicoChat isAuthenticated={isAuthenticated} />
    </div>
  );
};
