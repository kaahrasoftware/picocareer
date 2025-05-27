
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ResourceStats {
  totalResources: number;
  totalStorage: number;
  totalViews?: number;
  totalDownloads?: number;
  resourceTypes: Array<{ type: string; count: number; percentage: number }>;
  accessLevels: Array<{ level: string; count: number; percentage: number }>;
  downloadableStats: { downloadable: number; nonDownloadable: number };
  averageFileSize: number;
  resourcesPerEvent: Array<{ eventTitle: string; count: number; title: string }>;
  topEngagingResources?: Array<{ title: string; engagement: number; views: number; downloads: number }>;
  engagementByType?: Array<{ type: string; views: number; downloads: number; engagement_rate: number }>;
}

export function useEventResourceStats() {
  return useQuery({
    queryKey: ['event-resource-stats'],
    queryFn: async (): Promise<ResourceStats> => {
      console.log('Fetching event resource statistics...');
      
      try {
        // Get all event resources with event information and engagement data
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
            totalViews: 0,
            totalDownloads: 0,
            resourceTypes: [],
            accessLevels: [],
            downloadableStats: { downloadable: 0, nonDownloadable: 0 },
            averageFileSize: 0,
            resourcesPerEvent: [],
            topEngagingResources: [],
            engagementByType: []
          };
        }

        console.log('Processing', resources.length, 'event resources');

        const totalResources = resources.length;
        const totalStorage = resources.reduce((sum, resource) => sum + (resource.file_size || 0), 0);
        const totalViews = resources.reduce((sum, resource) => sum + (resource.view_count || 0), 0);
        const totalDownloads = resources.reduce((sum, resource) => sum + (resource.download_count || 0), 0);
        const averageFileSize = totalStorage / totalResources;

        // Resource types distribution
        const typeMap = new Map<string, { count: number; views: number; downloads: number }>();
        resources.forEach(resource => {
          const type = resource.resource_type || 'other';
          const existing = typeMap.get(type) || { count: 0, views: 0, downloads: 0 };
          typeMap.set(type, {
            count: existing.count + 1,
            views: existing.views + (resource.view_count || 0),
            downloads: existing.downloads + (resource.download_count || 0),
          });
        });

        const resourceTypes = Array.from(typeMap.entries())
          .map(([type, data]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            count: data.count,
            percentage: Math.round((data.count / totalResources) * 100)
          }))
          .sort((a, b) => b.count - a.count);

        // Engagement by type
        const engagementByType = Array.from(typeMap.entries())
          .map(([type, data]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            views: data.views,
            downloads: data.downloads,
            engagement_rate: data.count > 0 ? Math.round(((data.views + data.downloads) / data.count) * 100) / 100 : 0,
          }))
          .sort((a, b) => (b.views + b.downloads) - (a.views + a.downloads));

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

        // Top engaging resources
        const topEngagingResources = resources
          .map(resource => ({
            title: resource.title.length > 20 ? resource.title.substring(0, 20) + '...' : resource.title,
            engagement: (resource.view_count || 0) + (resource.download_count || 0),
            views: resource.view_count || 0,
            downloads: resource.download_count || 0,
          }))
          .filter(r => r.engagement > 0)
          .sort((a, b) => b.engagement - a.engagement)
          .slice(0, 5);

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
          .slice(0, 5)
          .map(event => ({
            ...event,
            title: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
            eventTitle: event.title, // Keep original for tooltip
          }));

        console.log('Event resource stats processed:', {
          totalResources,
          totalStorage,
          totalViews,
          totalDownloads,
          resourceTypes: resourceTypes.length,
          accessLevels: accessLevels.length
        });

        return {
          totalResources,
          totalStorage,
          totalViews,
          totalDownloads,
          resourceTypes,
          accessLevels,
          downloadableStats: { downloadable, nonDownloadable },
          averageFileSize,
          resourcesPerEvent,
          topEngagingResources,
          engagementByType
        };
      } catch (error) {
        console.error('Error in resource stats query:', error);
        // Return empty stats instead of throwing to prevent UI breaking
        return {
          totalResources: 0,
          totalStorage: 0,
          totalViews: 0,
          totalDownloads: 0,
          resourceTypes: [],
          accessLevels: [],
          downloadableStats: { downloadable: 0, nonDownloadable: 0 },
          averageFileSize: 0,
          resourcesPerEvent: [],
          topEngagingResources: [],
          engagementByType: []
        };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
