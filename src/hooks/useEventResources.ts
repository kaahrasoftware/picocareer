
import { useEventResourcesQuery } from './useEventResourcesQuery';

export function useEventResources(eventId: string) {
  const query = useEventResourcesQuery(eventId);
  
  return {
    resources: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
