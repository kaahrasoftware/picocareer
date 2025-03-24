
import { useCallback, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from 'react-router-dom';
import { useAuthSession } from '@/hooks/useAuthSession';

type InteractionType = "page_view" | "click" | "search" | "bookmark" | "content_view";

interface BatchedEvent {
  interaction_type: InteractionType;
  interaction_data?: any;
  element_id?: string;
  element_type?: string;
  page_path: string;
  profile_id: string;
  timestamp: number;
}

// Significantly increased batch size and interval to reduce API calls
const BATCH_SIZE = 50; // Increased from 25
const BATCH_INTERVAL = 120000; // Increased from 30 seconds to 2 minutes
const MAX_EVENTS_STORED = 100; // Maximum number of events to keep in memory

export function useAnalyticsBatch() {
  const batchRef = useRef<BatchedEvent[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef<boolean>(false);
  const flushErrorCountRef = useRef<number>(0);
  const location = useLocation();
  const { session } = useAuthSession();

  const flushEvents = useCallback(async () => {
    // Prevent concurrent flushes and don't flush if no session or empty batch
    if (processingRef.current || batchRef.current.length === 0 || !session?.user) return;
    
    // Skip flushing if we've had too many errors in a row
    if (flushErrorCountRef.current > 3) {
      console.warn('Skipping analytics flush due to multiple errors');
      return;
    }
    
    processingRef.current = true;
    const events = [...batchRef.current.slice(0, BATCH_SIZE)]; // Only process up to BATCH_SIZE events
    batchRef.current = batchRef.current.slice(events.length); // Remove processed events
    
    try {
      // Bail early if session is gone
      if (!session?.user?.id) {
        processingRef.current = false;
        return;
      }
      
      const { error } = await supabase
        .from('user_interactions')
        .insert(events.map(event => ({
          profile_id: session.user.id,
          interaction_type: event.interaction_type,
          interaction_data: event.interaction_data,
          element_id: event.element_id,
          element_type: event.element_type,
          page_path: event.page_path,
          created_at: new Date(event.timestamp).toISOString()
        })));

      if (error) {
        console.error('Error sending batched events:', error);
        flushErrorCountRef.current += 1;
        
        // Don't re-add events to the batch if we hit rate limits
        if (!error.message.includes('rate limit')) {
          // Only re-add events if it's not a rate limit error
          // Only keep the first few events to prevent overflow
          batchRef.current = [...events.slice(0, 5), ...batchRef.current]; 
        }
      } else {
        // Reset error count on successful flush
        flushErrorCountRef.current = 0;
      }
    } catch (error) {
      console.error('Error in flushEvents:', error);
      flushErrorCountRef.current += 1;
    } finally {
      processingRef.current = false;
    }
  }, [session?.user]);

  const addEvent = useCallback((
    eventType: InteractionType,
    data?: any,
    elementId?: string,
    elementType?: string
  ) => {
    if (!session?.user) {
      return;
    }
    
    // Prevent batch from growing too large
    if (batchRef.current.length >= MAX_EVENTS_STORED) {
      // If we've accumulated too many events, drop the oldest ones
      batchRef.current = batchRef.current.slice(-Math.floor(MAX_EVENTS_STORED / 2));
    }
    
    batchRef.current.push({
      interaction_type: eventType,
      interaction_data: data,
      element_id: elementId,
      element_type: elementType,
      page_path: location.pathname,
      profile_id: session.user.id,
      timestamp: Date.now()
    });

    if (batchRef.current.length >= BATCH_SIZE) {
      // Don't flush immediately, schedule it to avoid rate limiting
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          flushEvents();
          timerRef.current = null;
        }, 5000); // Increased delay to aggregate multiple near-simultaneous events
      }
    }
  }, [flushEvents, session?.user, location.pathname]);

  useEffect(() => {
    // Set up periodic flush with a randomized interval to avoid thundering herd
    const randomizedInterval = BATCH_INTERVAL + (Math.random() * 30000); // Add up to 30 seconds randomness
    timerRef.current = setInterval(flushEvents, randomizedInterval);

    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Final flush on unmount if needed
      if (batchRef.current.length > 0) {
        flushEvents();
      }
    };
  }, [flushEvents]);

  return { addEvent };
}
