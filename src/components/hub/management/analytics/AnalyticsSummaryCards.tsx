
import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsSummary } from "@/types/database/analytics";
import { Users, FileText, Bell, HardDrive, Circle } from "lucide-react";

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const calculatePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min(Math.round((current / limit) * 100), 100);
  };

  const memberPercentage = calculatePercentage(summary.activeMembers, summary.memberLimit);
  const storagePercentage = calculatePercentage(summary.storageUsed, summary.storageLimit);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Members</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{summary.activeMembers}</p>
              <p className="text-xs text-muted-foreground">
                of {summary.memberLimit} ({memberPercentage}%)
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
              <Circle 
                className="h-8 w-8" 
                style={{ 
                  strokeDasharray: '100',
                  strokeDashoffset: `${100 - memberPercentage}`,
                  stroke: memberPercentage > 90 ? '#ef4444' : '#3b82f6',
                  fill: 'none',
                  strokeWidth: '8'
                }} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Resources</p>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{summary.resourceCount}</p>
              <p className="text-xs text-muted-foreground">total resources</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Announcements</p>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{summary.announcementCount}</p>
              <p className="text-xs text-muted-foreground">total announcements</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Storage</p>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{formatBytes(summary.storageUsed)}</p>
              <p className="text-xs text-muted-foreground">
                of {formatBytes(summary.storageLimit)} ({storagePercentage}%)
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
              <Circle 
                className="h-8 w-8" 
                style={{ 
                  strokeDasharray: '100',
                  strokeDashoffset: `${100 - storagePercentage}`,
                  stroke: storagePercentage > 90 ? '#ef4444' : '#3b82f6',
                  fill: 'none',
                  strokeWidth: '8'
                }} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
