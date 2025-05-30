
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, School, Trophy } from "lucide-react";

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
  const { data: stats } = useQuery({
    queryKey: ['home-statistics'],
    queryFn: async () => {
      console.log('Fetching statistics...');
      const [
        { count: mentorsCount },
        { count: careersCount },
        { count: majorsCount },
        { count: schoolsCount },
        { count: scholarshipsCount },
        { count: opportunitiesCount },
        { count: eventsCount },
        { count: blogsCount }
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
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('opportunities')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'Active'),
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'Approved'),
        supabase
          .from('blogs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'Approved'),
      ]);

      console.log('Statistics fetched:', {
        mentors: mentorsCount,
        careers: careersCount,
        majors: majorsCount,
        schools: schoolsCount,
        scholarships: scholarshipsCount,
        opportunities: opportunitiesCount,
        events: eventsCount,
        blogs: blogsCount,
      });

      return {
        mentors: mentorsCount || 0,
        careers: careersCount || 0,
        majors: majorsCount || 0,
        schools: schoolsCount || 0,
        scholarships: scholarshipsCount || 0,
        opportunities: opportunitiesCount || 0,
        events: eventsCount || 0,
        blogs: blogsCount || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 3 // Retry failed requests 3 times
  });

  const totalResources =
    (stats?.scholarships || 0) +
    (stats?.opportunities || 0) +
    (stats?.events || 0) +
    (stats?.blogs || 0);

  const items = [
    {
      label: "Active Mentors",
      value: formatNumber(stats?.mentors || 0),
      icon: Users,
      color: "bg-purple-100 text-purple-600"
    },
    {
      label: "Career Paths",
      value: formatNumber(stats?.careers || 0),
      icon: Building,
      color: "bg-blue-100 text-blue-600"
    },
    {
      label: "Fields of Study",
      value: formatNumber(stats?.majors || 0),
      icon: School,
      color: "bg-green-100 text-green-600"
    },
    {
      label: "Schools",
      value: formatNumber(stats?.schools || 0),
      icon: School,
      color: "bg-orange-100 text-orange-600"
    },
    {
      label: "Resources",
      value: formatNumber(totalResources),
      icon: Trophy,
      color: "bg-rose-100 text-rose-600"
    }
  ];

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          Connect, Learn, Grow
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {items.map((item) => (
          <Card key={item.label} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-full ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold">{item.value}</h3>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

