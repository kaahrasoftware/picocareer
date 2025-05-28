
import React from 'react';
import { EventHeader } from '@/components/event/EventHeader';

export default function Events() {
  return (
    <div className="min-h-screen">
      <EventHeader />
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-muted-foreground mt-2">Discover upcoming events and opportunities.</p>
        </div>
      </div>
    </div>
  );
}
