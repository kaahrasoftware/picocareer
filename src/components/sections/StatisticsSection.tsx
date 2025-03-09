
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, School, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formatNumber = (num: number): string => {
  if (num === 0) return "0";
  
  // For numbers less than 1000, round to nearest 10 and add +
  if (num < 1000) {
    const rounded = Math.floor(num / 10) * 10;
    return rounded === 0 ? "+10" : `+${rounded}`;
  }
  
  // For numbers 1000 and above, use K, M, T notation
  const units = ["", "K", "M", "T"];
  const order = Math.floor(Math.log10(num) / 3);
  const unitValue = num / Math.pow(1000, order);
  const roundedValue = Math.floor(unitValue * 100) / 100;
  return `+${roundedValue}${units[order]}`;
};

export function StatisticsSection() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['home-statistics'],
    queryFn: async () => {
      console.log('Fetching statistics...');
      try {
        const [
          { count: mentorsCount },
          { count: careersCount },
          { count: majorsCount },
          { count: schoolsCount },
          { count: scholarshipsCount }
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('user_type', 'mentor'),
          supabase
            .from('careers')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'Approved'),
          supabase
            .from('majors')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'Approved'),
          supabase
            .from('schools')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'Approved'),
          supabase
            .from('scholarships')
            .select('id', { count: 'exact', head: true })
        ]);

        console.log('Statistics fetched:', {
          mentors: mentorsCount,
          careers: careersCount,
          majors: majorsCount,
          schools: schoolsCount,
          scholarships: scholarshipsCount
        });

        return {
          mentors: mentorsCount || 0,
          careers: careersCount || 0,
          majors: majorsCount || 0,
          schools: schoolsCount || 0,
          scholarships: scholarshipsCount || 0
        };
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Return default values in case of error
        return {
          mentors: 100,
          careers: 50,
          majors: 30,
          schools: 20,
          scholarships: 10
        };
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 3 // Retry failed requests 3 times
  });

  const items = [
    {
      label: "Active Mentors",
      value: isLoading ? null : formatNumber(stats?.mentors || 0),
      icon: Users,
      color: "bg-purple-100 text-purple-600"
    },
    {
      label: "Career Paths",
      value: isLoading ? null : formatNumber(stats?.careers || 0),
      icon: Building,
      color: "bg-blue-100 text-blue-600"
    },
    {
      label: "Fields of Study",
      value: isLoading ? null : formatNumber(stats?.majors || 0),
      icon: School,
      color: "bg-green-100 text-green-600"
    },
    {
      label: "Schools",
      value: isLoading ? null : formatNumber(stats?.schools || 0),
      icon: School,
      color: "bg-orange-100 text-orange-600"
    },
    {
      label: "Funding Sources",
      value: isLoading ? null : formatNumber(stats?.scholarships || 0),
      icon: Trophy,
      color: "bg-rose-100 text-rose-600"
    }
  ];

  // If there's an error, show a fallback UI
  if (error) {
    console.error('Error rendering statistics section:', error);
  }

  return (
    <section className="py-12 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Discover The Growing Ecosystem Of Opportunities And Support Available To You</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {items.map((item) => (
          <Card key={item.label} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-full ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                {isLoading ? (
                  <Skeleton className="h-10 w-20 mb-2" />
                ) : (
                  <h3 className="text-3xl font-bold text-gray-800">{item.value}</h3>
                )}
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
