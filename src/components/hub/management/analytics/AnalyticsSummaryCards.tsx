
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Megaphone, UserCheck } from "lucide-react";
import { AnalyticsSummary } from "@/types/database/analytics";

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const stats = [
    {
      title: "Total Members",
      value: summary.totalMembers,
      icon: Users,
      description: "Total approved members"
    },
    {
      title: "Active Members",
      value: summary.activeMembers,
      icon: UserCheck,
      description: "Active in last 30 days"
    },
    {
      title: "Resources",
      value: summary.resourceCount,
      icon: FileText,
      description: "Total resources shared"
    },
    {
      title: "Announcements",
      value: summary.announcementCount,
      icon: Megaphone,
      description: "Total announcements made"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
