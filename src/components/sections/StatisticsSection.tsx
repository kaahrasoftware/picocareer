import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, Building, School, Trophy, Calendar } from "lucide-react";

export function StatisticsSection() {
  const { data: stats, refetch } = useQuery({
    queryKey: ['home-statistics'],
    queryFn: async () => {
      const [
        { count: mentorsCount },
        { count: careersCount },
        { count: majorsCount },
        { count: schoolsCount },
        { count: scholarshipsCount },
        { count: sessionsCount }
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
          .from('mentor_sessions')
          .select('id', { count: 'exact', head: true })
      ]);

      return {
        mentors: mentorsCount || 0,
        careers: careersCount || 0,
        majors: majorsCount || 0,
        schools: schoolsCount || 0,
        scholarships: scholarshipsCount || 0,
        sessions: sessionsCount || 0
      };
    }
  });

  // Subscribe to real-time updates for mentor_sessions
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'mentor_sessions'
        },
        () => {
          // Refetch statistics when any change occurs
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

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
      label: "Academic Programs",
      value: stats?.majors || 0,
      icon: GraduationCap,
      color: "bg-green-100 text-green-600"
    },
    {
      label: "Universities",
      value: stats?.schools || 0,
      icon: School,
      color: "bg-orange-100 text-orange-600"
    },
    {
      label: "Scholarships",
      value: stats?.scholarships || 0,
      icon: Trophy,
      color: "bg-rose-100 text-rose-600"
    },
    {
      label: "Sessions Booked",
      value: stats?.sessions || 0,
      icon: Calendar,
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <section className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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