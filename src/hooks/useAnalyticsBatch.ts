
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

// Increased batch size and interval to reduce API calls
const BATCH_SIZE = 20; // Increased from 10
const BATCH_INTERVAL = 10000; // Increased from 5000 to 10 seconds

export function useAnalyticsBatch() {
  const batchRef = useRef<BatchedEvent[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef<boolean>(false);
  const location = useLocation();
  const { session } = useAuthSession();

  const flushEvents = useCallback(async () => {
    // Prevent concurrent flushes and don't flush if no session or empty batch
    if (processingRef.current || batchRef.current.length === 0 || !session?.user) return;
    
    processingRef.current = true;
    const events = [...batchRef.current];
    batchRef.current = [];

    try {
      // No need to reprocess events that fail due to rate limiting
      // Just log the error and continue
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
        // Don't re-add events to the batch if we hit rate limits
        if (!error.message.includes('rate limit')) {
          // Only re-add events if it's not a rate limit error
          batchRef.current = [...events.slice(0, 5), ...batchRef.current]; // Only keep the first 5 to prevent overflow
        }
      }
    } catch (error) {
      console.error('Error in flushEvents:', error);
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
    if (batchRef.current.length >= BATCH_SIZE * 2) {
      // If we've accumulated too many events, start dropping the oldest ones
      batchRef.current = batchRef.current.slice(-BATCH_SIZE);
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
      flushEvents();
    }
  }, [flushEvents, session?.user, location.pathname]);

  useEffect(() => {
    // Set up periodic flush
    timerRef.current = setInterval(flushEvents, BATCH_INTERVAL);

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
