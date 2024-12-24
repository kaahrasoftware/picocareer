import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore } from "date-fns";

interface RecentToggleProps {
  showRecentOnly: boolean;
  setShowRecentOnly: (value: boolean) => void;
}

export function RecentToggle({ showRecentOnly, setShowRecentOnly }: RecentToggleProps) {
  // Update recent status of blogs older than 15 days
  useQuery({
    queryKey: ['update-recent-blogs'],
    queryFn: async () => {
      const fifteenDaysAgo = addDays(new Date(), -15);
      
      const { data: oldPosts, error } = await supabase
        .from('blogs')
        .update({ is_recent: false })
        .eq('is_recent', true)
        .lt('created_at', fifteenDaysAgo.toISOString())
        .select();

      if (error) {
        console.error('Error updating recent blog posts:', error);
      }
      
      return oldPosts;
    },
    // Run this query every hour to keep the recent status updated
    refetchInterval: 1000 * 60 * 60,
  });

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="recent-posts"
        checked={showRecentOnly}
        onCheckedChange={setShowRecentOnly}
      />
      <Label htmlFor="recent-posts">Recent posts only</Label>
    </div>
  );
}
