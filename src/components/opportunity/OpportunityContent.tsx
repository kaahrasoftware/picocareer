
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Users, Bookmark } from "lucide-react";
import { OpportunityWithAuthor } from "@/types/opportunity/types";

interface OpportunityContentProps {
  opportunity: OpportunityWithAuthor;
}

export function OpportunityContent({ opportunity }: OpportunityContentProps) {
  const analytics = (opportunity as any).analytics || {
    views_count: 0,
    checked_out_count: 0,
    bookmarks_count: 0
  };

  return (
    <div className="space-y-6">
      <Separator />

      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: opportunity.description }} />
      </div>

      {opportunity.categories && opportunity.categories.length > 0 && (
        <div className="pt-2">
          <h3 className="text-sm font-medium mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {opportunity.categories.map((category) => (
              <Badge key={category} variant="secondary">{category}</Badge>
            ))}
          </div>
        </div>
      )}

      {opportunity.tags && opportunity.tags.length > 0 && (
        <div className="pt-2">
          <h3 className="text-sm font-medium mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {opportunity.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4 pt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{analytics.checked_out_count || 0} checked out</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{analytics.views_count || 0} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Bookmark className="h-4 w-4" />
          <span>{analytics.bookmarks_count || 0} bookmarks</span>
        </div>
      </div>
    </div>
  );
}
