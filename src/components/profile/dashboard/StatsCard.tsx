import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ContentDetailsDialog } from "./ContentDetailsDialog";

interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  contentType?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, contentType }: StatsCardProps) {
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
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
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