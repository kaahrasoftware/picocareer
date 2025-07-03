
import React from 'react';
import { EventHeader } from '@/components/event/EventHeader';
import { EventCard } from '@/components/event/EventCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export default function Events() {
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const handleRegister = (eventId: string) => {
    console.log('Register for event:', eventId);
  };

  const handleViewDetails = (eventId: string) => {
    console.log('View details for event:', eventId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <EventHeader filter={filter} onFilterChange={setFilter} />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event}
              onRegister={handleRegister}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
