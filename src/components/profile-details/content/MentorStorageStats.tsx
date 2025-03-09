
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/utils/storageUtils";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MentorStorageStats {
  mentor_id: string;
  total_storage_bytes: number;
  file_count: number;
  pdf_count: number;
  presentation_count: number;
  document_count: number;
  spreadsheet_count: number;
  image_count: number;
  blog_count: number;
  link_count: number;
  other_count: number;
  last_calculated_at: string;
}

interface MentorStorageStatsProps {
  metrics: MentorStorageStats;
}

export function MentorStorageStats({ metrics }: MentorStorageStatsProps) {
  // Default storage limit - 100MB for mentors
  const storageLimit = 100 * 1024 * 1024; // 100MB in bytes
  const usedPercentage = Math.min(100, (metrics.total_storage_bytes / storageLimit) * 100);
  
  const getCountBreakdown = () => {
    const counts = [
      { type: 'PDF', count: metrics.pdf_count },
      { type: 'Presentations', count: metrics.presentation_count },
      { type: 'Documents', count: metrics.document_count },
      { type: 'Spreadsheets', count: metrics.spreadsheet_count },
      { type: 'Images', count: metrics.image_count },
      { type: 'Blogs', count: metrics.blog_count },
      { type: 'Links', count: metrics.link_count },
      { type: 'Other', count: metrics.other_count },
    ];
    
    return counts.filter(item => item.count > 0);
  };
  
  const countsBreakdown = getCountBreakdown();
  
  return (
    <div className="w-full p-3 bg-muted/30 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium">Storage Usage</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Storage used by your uploaded content. Limit is 100MB per mentor.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatFileSize(metrics.total_storage_bytes)} of {formatFileSize(storageLimit)} used
        </div>
      </div>
      
      <Progress value={usedPercentage} className="h-2" />
      
      {metrics.file_count > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="text-muted-foreground">
            {metrics.file_count} {metrics.file_count === 1 ? 'file' : 'files'}:
          </span>
          {countsBreakdown.map((item) => (
            <span key={item.type} className="px-2 py-0.5 bg-background rounded-full">
              {item.count} {item.type}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
