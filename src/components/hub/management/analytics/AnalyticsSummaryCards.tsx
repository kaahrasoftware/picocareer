
import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsSummary } from '@/types/database/analytics';
import { Users, FileText, Bell, HardDrive } from 'lucide-react';
import { formatFileSize } from "@/utils/storageUtils";

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  // Calculate percentages with safeguards against division by zero
  const calculatePercentage = (value: number, max: number): number => {
    if (max <= 0) return 0;
    return Math.min(Math.round((value / max) * 100), 100);
  };

  // Calculate percentages with fallback values
  const memberPercentage = calculatePercentage(summary.activeMembers, summary.memberLimit || 100);
  const storagePercentage = calculatePercentage(summary.storageUsage, summary.storageLimit);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Members Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Members</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-bold">{summary.activeMembers}</h4>
                <span className="text-xs text-muted-foreground">/ {summary.memberLimit || 100}</span>
              </div>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${memberPercentage}%` }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{memberPercentage}% of capacity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Resources</p>
              <h4 className="text-2xl font-bold">{summary.resourceCount || summary.totalResources}</h4>
              <p className="mt-1 text-xs text-muted-foreground">Shared content items</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <Bell className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Announcements</p>
              <h4 className="text-2xl font-bold">{summary.announcementCount || summary.totalAnnouncements}</h4>
              <p className="mt-1 text-xs text-muted-foreground">Posted notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <HardDrive className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Storage</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-bold">{formatFileSize(summary.storageUsage)}</h4>
                <span className="text-xs text-muted-foreground">/ {formatFileSize(summary.storageLimit)}</span>
              </div>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${storagePercentage}%` }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{storagePercentage}% used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
