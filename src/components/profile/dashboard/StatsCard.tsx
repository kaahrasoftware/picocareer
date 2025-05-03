
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentDetailsDialog } from "./ContentDetailsDialog";

// Import the ContentType type or redefine it here
type ContentType = "blogs" | "videos" | "careers" | "majors" | "schools" | "companies";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
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
  loading,
  valueClassName
}: StatsCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const isClickable = contentType !== undefined;

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
          <div className="text-muted-foreground">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${valueClassName || ''}`}>{loading ? '–' : value}</div>
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
