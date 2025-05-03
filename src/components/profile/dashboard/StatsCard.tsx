
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentDetailsDialog } from "./ContentDetailsDialog";

// Import the ContentType type or redefine it here
type ContentType = "blogs" | "videos" | "careers" | "majors" | "schools" | "companies";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode; // Ensure this is typed as ReactNode
  contentType?: ContentType;
  loading?: boolean;
  valueClassName?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  contentType, 
  loading = false,
  valueClassName = ""
}: StatsCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const isClickable = contentType !== undefined;

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="h-5 w-16 bg-muted animate-pulse rounded"></div>
          {subtitle && (
            <div className="h-3 w-24 bg-muted animate-pulse rounded mt-2"></div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className={`${isClickable ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
        onClick={() => isClickable && setShowDetails(true)}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
          )}
        </CardContent>
      </Card>

      {contentType && (
        <ContentDetailsDialog
          open={showDetails}
          onOpenChange={setShowDetails}
          contentType={contentType}
        />
      )}
    </>
  );
}
