import { useCallback, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface BatchedEvent {
  event_type: string;
  data: any;
  timestamp: number;
}

const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 seconds

export function useAnalyticsBatch() {
  const batchRef = useRef<BatchedEvent[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const flushEvents = useCallback(async () => {
    if (batchRef.current.length === 0) return;

    const events = [...batchRef.current];
    batchRef.current = [];

    try {
      const { error } = await supabase
        .from('user_interactions')
        .insert(events.map(event => ({
          interaction_type: event.event_type,
          interaction_data: event.data,
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
  }, []);

  const addEvent = useCallback((eventType: string, data: any) => {
    batchRef.current.push({
      event_type: eventType,
      data,
      timestamp: Date.now()
    });

    if (batchRef.current.length >= BATCH_SIZE) {
      flushEvents();
    }
  }, [flushEvents]);

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