import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format } from "date-fns";

interface ActivityChartProps {
  title: string;
}

export function ActivityChart({ title }: ActivityChartProps) {
  const { data: chartData } = useQuery({
    queryKey: ['user-registrations'],
    queryFn: async () => {
      // Get date 12 months ago
      const startDate = subMonths(new Date(), 11);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Create a map of months with initial count of 0
      const monthsMap = new Map();
      for (let i = 0; i < 12; i++) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, 'MMM yyyy');
        monthsMap.set(monthKey, 0);
      }

      // Count registrations per month
      data.forEach(profile => {
        const monthKey = format(new Date(profile.created_at), 'MMM yyyy');
        if (monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, monthsMap.get(monthKey) + 1);
        }
      });

      // Convert map to array format for Recharts
      return Array.from(monthsMap.entries())
        .map(([month, count]) => ({
          month,
          total: count,
        }))
        .reverse(); // Show oldest month first
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#0EA5E9" name="New Users" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}