
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HubAnnouncement } from "@/types/database/hubs";

export function useAnnouncements(hubId: string, sortByRecent: boolean) {
  return useQuery({
    queryKey: ['hub-announcements', hubId, sortByRecent],
    queryFn: async () => {
      const {
        data: announcementsData,
        error: announcementsError
      } = await supabase.from('hub_announcements').select('*').eq('hub_id', hubId).order('created_at', {
        ascending: !sortByRecent
      });
      if (announcementsError) throw announcementsError;

      const creatorIds = announcementsData.map(a => a.created_by).filter(Boolean);
      const {
        data: profilesData,
        error: profilesError
      } = await supabase.from('profiles').select('id, first_name, last_name').in('id', creatorIds);
      if (profilesError) throw profilesError;

      const profileMap = new Map(profilesData?.map(p => [p.id, p]));
      
      // Map category to the correct type before returning
      return announcementsData.map(announcement => {
        // Ensure category is one of the valid enum values
        let category = announcement.category;
        if (!['general', 'event', 'update', 'resource', 'job', 'academic'].includes(category)) {
          category = 'general';
        }
        
        return {
          ...announcement,
          category: category as HubAnnouncement['category'],
          created_by_profile: profileMap.get(announcement.created_by) || null
        };
      }) as HubAnnouncement[];
    },
    enabled: !!hubId
  });
}
