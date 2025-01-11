import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, School, Trophy } from "lucide-react";

export function StatisticsSection() {
  const { data: stats } = useQuery({
    queryKey: ['home-statistics'],
    queryFn: async () => {
      console.log('Fetching statistics...');
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
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 3 // Retry failed requests 3 times
  });

  const items = [
    {
      label: "Active Mentors",
      value: stats?.mentors || 0,
      icon: Users,
      color: "bg-purple-100 text-purple-600"
    },
    {
      label: "Career Paths",
      value: stats?.careers || 0,
      icon: Building,
      color: "bg-blue-100 text-blue-600"
    },
    {
      label: "Fields of Study",
      value: stats?.majors || 0,
      icon: School,
      color: "bg-green-100 text-green-600"
    },
    {
      label: "Universities",
      value: stats?.schools || 0,
      icon: School,
      color: "bg-orange-100 text-orange-600"
    },
    {
      label: "Funding Sources",
      value: stats?.scholarships || 0,
      icon: Trophy,
      color: "bg-rose-100 text-rose-600"
    }
  ];

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <Card className="inline-block px-8 py-4 bg-white/5 backdrop-blur-sm border-picocareer-primary/20">
          <h3 className="text-3xl font-bold">
            Discover The Growing Ecosystem Of Opportunities And Support Available To You
          </h3>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {items.map((item) => (
          <Card key={item.label} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-full ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold">{item.value.toLocaleString()}</h3>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}