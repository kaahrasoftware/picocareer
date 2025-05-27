
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

interface MemberGrowthChartProps {
  hubId: string;
}

export function MemberGrowthChart({ hubId }: MemberGrowthChartProps) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMemberGrowth() {
      setIsLoading(true);
      try {
        const { data: memberGrowthData, error } = await supabase
          .from('hub_member_growth')
          .select('*')
          .eq('hub_id', hubId)
          .order('month', { ascending: true });

        if (error) throw error;

        const processedData = processData(memberGrowthData || []);
        setData(processedData);
      } catch (error) {
        console.error("Error fetching member growth:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (hubId) {
      fetchMemberGrowth();
    }
  }, [hubId]);

  const processData = (rawData: any[]) => {
    // Group by year and month, ensuring safe property access
    const grouped = rawData.reduce((acc, item) => {
      if (!item || typeof item !== 'object') return acc;
      
      // Safe property access with fallbacks
      const monthStr = item.month || new Date().toISOString();
      const newMembers = typeof item.new_members === 'number' ? item.new_members : 0;
      
      try {
        const date = new Date(monthStr);
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;
        
        if (!acc[key]) {
          acc[key] = {
            date: monthStr,
            year: year,
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            new_members: 0
          };
        }
        acc[key].new_members += newMembers;
        
        return acc;
      } catch (error) {
        console.error('Error processing date:', error);
        return acc;
      }
    }, {} as Record<string, any>);

    // Convert to array and sort by date
    return Object.values(grouped).sort((a: any, b: any) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateA.getTime() - dateB.getTime();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Growth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading member growth data...</p>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="new_members" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p>No member growth data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
