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

const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 seconds

export function useAnalyticsBatch() {
  const batchRef = useRef<BatchedEvent[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const { session } = useAuthSession();

  const flushEvents = useCallback(async () => {
    if (batchRef.current.length === 0 || !session?.user) return;

    const events = [...batchRef.current];
    batchRef.current = [];

    try {
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
        // Re-add failed events to the batch
        batchRef.current = [...events, ...batchRef.current];
      }
    } catch (error) {
      console.error('Error in flushEvents:', error);
      // Re-add failed events to the batch
      batchRef.current = [...events, ...batchRef.current];
    }
  }, [session?.user]);

  const addEvent = useCallback((
    eventType: InteractionType,
    data?: any,
    elementId?: string,
    elementType?: string
  ) => {
    if (!session?.user) {
      console.log('User not authenticated, skipping analytics event');
      return;
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
      flushEvents();
    };
  }, [flushEvents]);

  return { addEvent };
}