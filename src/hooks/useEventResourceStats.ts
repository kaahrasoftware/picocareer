
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ResourceStats {
  totalResources: number;
  totalStorage: number;
  resourceTypes: Array<{ type: string; count: number; percentage: number }>;
  accessLevels: Array<{ level: string; count: number; percentage: number }>;
  downloadableStats: { downloadable: number; nonDownloadable: number };
  averageFileSize: number;
  resourcesPerEvent: Array<{ eventTitle: string; count: number }>;
}

export function useEventResourceStats() {
  return useQuery({
    queryKey: ['event-resource-stats'],
    queryFn: async (): Promise<ResourceStats> => {
      console.log('Fetching event resource statistics...');
      
      try {
        // Get all event resources with event information
        const { data: resources, error } = await supabase
          .from('event_resources')
          .select(`
            *,
            events!inner(
              id,
              title
            )
          `);

        if (error) {
          console.error('Error fetching event resources:', error);
          throw error;
        }

        if (!resources || resources.length === 0) {
          console.log('No event resources found');
          return {
            totalResources: 0,
            totalStorage: 0,
            resourceTypes: [],
            accessLevels: [],
            downloadableStats: { downloadable: 0, nonDownloadable: 0 },
            averageFileSize: 0,
            resourcesPerEvent: []
          };
        }

        console.log('Processing', resources.length, 'event resources');

        const totalResources = resources.length;
        const totalStorage = resources.reduce((sum, resource) => sum + (resource.file_size || 0), 0);
        const averageFileSize = totalStorage / totalResources;

        // Resource types distribution
        const typeMap = new Map<string, number>();
        resources.forEach(resource => {
          const type = resource.resource_type || 'other';
          typeMap.set(type, (typeMap.get(type) || 0) + 1);
        });

        const resourceTypes = Array.from(typeMap.entries())
          .map(([type, count]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            count,
            percentage: Math.round((count / totalResources) * 100)
          }))
          .sort((a, b) => b.count - a.count);

        // Access levels distribution
        const accessMap = new Map<string, number>();
        resources.forEach(resource => {
          const level = resource.access_level || 'public';
          accessMap.set(level, (accessMap.get(level) || 0) + 1);
        });

        const accessLevels = Array.from(accessMap.entries())
          .map(([level, count]) => ({
            level: level.replace('_', ' ').charAt(0).toUpperCase() + level.replace('_', ' ').slice(1),
            count,
            percentage: Math.round((count / totalResources) * 100)
          }));

        // Downloadable stats
        const downloadable = resources.filter(r => r.is_downloadable).length;
        const nonDownloadable = totalResources - downloadable;

        // Resources per event
        const eventMap = new Map<string, { title: string; count: number }>();
        resources.forEach(resource => {
          const event = resource.events;
          if (event) {
            const existing = eventMap.get(event.id) || { title: event.title, count: 0 };
            eventMap.set(event.id, { ...existing, count: existing.count + 1 });
          }
        });

        const resourcesPerEvent = Array.from(eventMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 events

        console.log('Event resource stats processed:', {
          totalResources,
          totalStorage,
          resourceTypes: resourceTypes.length,
          accessLevels: accessLevels.length
        });

        return {
          totalResources,
          totalStorage,
          resourceTypes,
          accessLevels,
          downloadableStats: { downloadable, nonDownloadable },
          averageFileSize,
          resourcesPerEvent
        };
      } catch (error) {
        console.error('Error in resource stats query:', error);
        // Return empty stats instead of throwing to prevent UI breaking
        return {
          totalResources: 0,
          totalStorage: 0,
          resourceTypes: [],
          accessLevels: [],
          downloadableStats: { downloadable: 0, nonDownloadable: 0 },
          averageFileSize: 0,
          resourcesPerEvent: []
        };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
