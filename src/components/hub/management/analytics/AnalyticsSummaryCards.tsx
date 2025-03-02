
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Database, Users, MessageSquare, FileText, HardDrive } from "lucide-react";

interface AnalyticsSummaryCardsProps {
  summary: any;
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  // Format storage size with improved unit handling
  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    // Ensure we don't exceed available units
    const unitIndex = Math.min(i, units.length - 1);
    
    // Format with appropriate precision (more decimals for smaller numbers)
    return `${(bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
  };

  // Calculate percentages with safeguards against division by zero
  const storagePercent = summary.storageLimit > 0 
    ? (summary.storageUsed / summary.storageLimit) * 100 
    : 0;
  
  const memberPercent = summary.memberLimit > 0 
    ? (summary.memberCount / summary.memberLimit) * 100 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Database className="mr-2 h-4 w-4 text-muted-foreground" />
            Storage Used
          </CardTitle>
          <Badge variant={storagePercent > 90 ? "destructive" : storagePercent > 70 ? "warning" : "outline"}>
            {storagePercent.toFixed(1)}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatStorageSize(summary.storageUsed)}
          </div>
          <CardDescription>
            of {formatStorageSize(summary.storageLimit)}
          </CardDescription>
          <Progress value={storagePercent} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            Members
          </CardTitle>
          <Badge variant={memberPercent > 90 ? "destructive" : memberPercent > 70 ? "warning" : "outline"}>
            {memberPercent.toFixed(1)}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.memberCount}
          </div>
          <CardDescription>
            of {summary.memberLimit}
          </CardDescription>
          <Progress value={memberPercent} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
            Announcements
          </CardTitle>
          <Badge variant="outline">{summary.announcementsCount}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.announcementsCount}
          </div>
          <CardDescription>
            Total announcements published
          </CardDescription>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${Math.min(100, summary.announcementsCount * 5)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
            Resources
          </CardTitle>
          <Badge variant="outline">{summary.resourcesCount}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.resourcesCount}
          </div>
          <CardDescription>
            Total resources uploaded
          </CardDescription>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${Math.min(100, summary.resourcesCount * 5)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <HardDrive className="mr-2 h-4 w-4 text-muted-foreground" />
            Resources Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatStorageSize(summary.resourcesStorageUsed || 0)}
          </div>
          <CardDescription>
            Used for resources ({(((summary.resourcesStorageUsed || 0) / summary.storageUsed) * 100).toFixed(1)}% of total)
          </CardDescription>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${Math.min(100, ((summary.resourcesStorageUsed || 0) / summary.storageLimit) * 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
