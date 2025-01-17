import { Card } from "@/components/ui/card";
import { ActivityChart } from "@/components/profile/dashboard/ActivityChart";
import { ContentDistributionChart } from "@/components/profile/dashboard/ContentDistributionChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function ChartsTab() {
  // Query for user activity data (new users per month)
  const { data: userActivityData } = useQuery({
    queryKey: ['userActivity'],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12); // Last 12 months

      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Group by month
      const monthlyData = data.reduce((acc: any, item) => {
        const month = format(new Date(item.created_at), 'MMM');
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(monthlyData).map(([month, total]) => ({
        month,
        total: total as number,
        completed: Math.floor((total as number) * 0.8) // Example completion rate
      }));
    }
  });

  // Query for user distribution data
  const { data: userDistributionData } = useQuery({
    queryKey: ['userDistribution'],
    queryFn: async () => {
      const { data: mentors, error: mentorsError } = await supabase
        .from('profiles')
        .select('count')
        .eq('user_type', 'mentor');

      const { data: total, error: totalError } = await supabase
        .from('profiles')
        .select('count');

      if (mentorsError || totalError) throw new Error('Failed to fetch data');

      const mentorCount = mentors?.length || 0;
      const totalCount = total?.length || 0;
      const menteeCount = totalCount - mentorCount;

      return [
        { name: 'Mentors', value: mentorCount },
        { name: 'Mentees', value: menteeCount }
      ];
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <ActivityChart 
        data={userActivityData || []} 
        title="Monthly User Registration" 
      />
      <ContentDistributionChart 
        data={userDistributionData || []} 
        title="User Distribution" 
      />
    </div>
  );
}