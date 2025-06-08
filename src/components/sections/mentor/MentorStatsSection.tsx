
import { Card, CardContent } from "@/components/ui/card";
import { useMentorStats } from "@/hooks/useMentorStats";
import { Skeleton } from "@/components/ui/skeleton";

export const MentorStatsSection = () => {
  const { data: stats, isLoading } = useMentorStats();

  const mentorStats = [
    { 
      number: isLoading ? "..." : `${stats?.satisfactionRate}%`, 
      label: "Student Satisfaction Rate",
      gradient: "from-emerald-400 to-cyan-400",
      iconBg: "bg-emerald-100",
      textColor: "text-emerald-600"
    },
    { 
      number: isLoading ? "..." : `${Math.floor((stats?.totalSessions || 0) / 1000)}K+`, 
      label: "Successful Mentoring Sessions",
      gradient: "from-blue-400 to-purple-400", 
      iconBg: "bg-blue-100",
      textColor: "text-blue-600"
    },
    { 
      number: isLoading ? "..." : `${stats?.mentorCount}+`, 
      label: "Active Mentors",
      gradient: "from-purple-400 to-pink-400",
      iconBg: "bg-purple-100", 
      textColor: "text-purple-600"
    }
  ];

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mentoring Impact at PicoCareer
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our mentors are making a real difference in students' academic and career journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <Skeleton className="h-12 w-20 mx-auto mb-4" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Mentoring Impact at PicoCareer
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our mentors are making a real difference in students' academic and career journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {mentorStats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
              <div className={`h-2 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-8 relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.iconBg} mb-4 relative z-10`}>
                  <div className={`text-4xl font-bold ${stat.textColor}`}>
                    {stat.number.charAt(0)}
                  </div>
                </div>
                <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
