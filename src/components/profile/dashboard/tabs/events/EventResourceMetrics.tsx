
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";

interface EventResourceMetricsProps {
  eventId?: string;
  className?: string;
}

export function EventResourceMetrics({ eventId, className }: EventResourceMetricsProps) {
  // Mock data - replace with actual data fetching
  const metrics = {
    totalResources: 12,
    totalViews: 1420,
    totalDownloads: 387,
    uniqueViewers: 95,
    avgEngagementTime: "3m 42s",
    topResource: {
      name: "Event Slides - Introduction to AI",
      views: 234,
      downloads: 67
    }
  };

  const resourceTypes = [
    { type: "PDF", count: 8, color: "bg-red-500" },
    { type: "PPTX", count: 3, color: "bg-blue-500" },
    { type: "DOCX", count: 1, color: "bg-green-500" }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalResources}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last event
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              27% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uniqueViewers}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {metrics.avgEngagementTime}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resource Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resourceTypes.map((type) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${type.color}`} />
                  <span className="font-medium">{type.type}</span>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {type.count} files
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Resource */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Resource</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">{metrics.topResource.name}</h4>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {metrics.topResource.views} views
                </div>
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  {metrics.topResource.downloads} downloads
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <TrendingUp className="h-3 w-3 mr-1" />
              Top
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
        <Button variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </div>
    </div>
  );
}
