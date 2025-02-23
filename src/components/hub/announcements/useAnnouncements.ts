
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAnnouncements(hubId: string, sortByRecent: boolean) {
  return useQuery({
    queryKey: ['hub-announcements', hubId],
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
      return announcementsData.map(announcement => ({
        ...announcement,
        created_by_profile: profileMap.get(announcement.created_by) || null
      }));
    }
  });
}
