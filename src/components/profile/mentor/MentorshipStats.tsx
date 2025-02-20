
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMentorStats } from "./hooks/useMentorStats";
import { Star, Users, CalendarCheck, Clock, Ban, Shield, CalendarX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MentorshipStatsProps {
  profileId: string;
}

export function MentorshipStats({ profileId }: MentorshipStatsProps) {
  const { stats } = useMentorStats(profileId);

  if (!stats) {
    return (
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
        {[...Array(7)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[100px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-[60px]" />
              </div>
              <p className="text-xs text-muted-foreground">
                <Skeleton className="h-3 w-[80px]" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Sessions",
      value: stats.total_sessions,
      icon: Users,
      subtitle: `${stats.unique_mentees} unique mentee${stats.unique_mentees !== 1 ? 's' : ''}`,
      iconColor: "text-blue-500"
    },
    {
      title: "Completed",
      value: stats.completed_sessions,
      icon: CalendarCheck,
      subtitle: stats.upcoming_sessions > 0 
        ? `${stats.upcoming_sessions} upcoming`
        : "No upcoming sessions",
      iconColor: "text-green-500"
    },
    {
      title: "Hours Mentored",
      value: stats.total_hours,
      icon: Clock,
      subtitle: "Total mentoring time",
      iconColor: "text-orange-500"
    },
    {
      title: "Cancelled",
      value: stats.cancelled_sessions,
      icon: CalendarX,
      subtitle: "By mentor or mentee",
      iconColor: "text-rose-500"
    },
    {
      title: "No-shows",
      value: stats.no_show_sessions,
      icon: Ban,
      subtitle: "Mentee did not show up",
      iconColor: "text-red-500"
    },
    {
      title: "Average Rating",
      value: stats.total_ratings > 0 ? stats.average_rating.toFixed(1) : "N/A",
      icon: Star,
      subtitle: `${stats.total_ratings} rating${stats.total_ratings !== 1 ? 's' : ''}`,
      iconColor: "text-yellow-500"
    },
    {
      title: "Reliability Score",
      value: `${stats.cancellation_score}%`,
      icon: Shield,
      subtitle: "Based on attendance",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
