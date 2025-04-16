
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, ExternalLink, BookmarkPlus, Bookmark, Share2 } from "lucide-react";
import { format } from "date-fns";
import { OpportunityWithAuthor } from "@/types/opportunity/types";

interface OpportunitySidebarProps {
  opportunity: OpportunityWithAuthor;
  onApply: () => void;
  onExternalClick: () => void;
  onShare: () => void;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
  bookmarkLoading: boolean;
  clickLoading: boolean;
}

export function OpportunitySidebar({
  opportunity,
  onApply,
  onExternalClick,
  onShare,
  onToggleBookmark,
  isBookmarked,
  bookmarkLoading,
  clickLoading
}: OpportunitySidebarProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 sticky top-24 space-y-6">
      {opportunity.compensation && (
        <div>
          <h3 className="font-medium mb-1 text-sm">Compensation</h3>
          <p className="font-semibold text-lg">{opportunity.compensation}</p>
        </div>
      )}

      {opportunity.deadline && (
        <div>
          <h3 className="font-medium mb-1 text-sm">Application Deadline</h3>
          <div className="flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatDate(opportunity.deadline)}</span>
          </div>
        </div>
      )}

      <Separator />

      <div className="flex flex-col gap-3">
        {opportunity.application_url ? (
          <Button 
            className="w-full gap-2" 
            onClick={onExternalClick}
            disabled={clickLoading}
          >
            <ExternalLink className="h-4 w-4" />
            {clickLoading ? 'Processing...' : 'Check it out'}
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onApply}
          >
            Apply Now
          </Button>
        )}

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={onToggleBookmark}
          disabled={bookmarkLoading}
        >
          {isBookmarked ? (
            <>
              <Bookmark className="h-4 w-4 fill-current" />
              Bookmarked
            </>
          ) : (
            <>
              <BookmarkPlus className="h-4 w-4" />
              Bookmark
            </>
          )}
        </Button>

        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-center gap-2"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      {opportunity.profiles && (
        <div className="pt-4 border-t border-border">
          <h3 className="font-medium mb-2 text-sm">Posted by</h3>
          <div className="flex items-center gap-3">
            {opportunity.profiles.avatar_url ? (
              <Avatar>
                <AvatarImage 
                  src={opportunity.profiles.avatar_url} 
                  alt={opportunity.profiles.full_name || "User"} 
                />
                <AvatarFallback>{(opportunity.profiles.full_name || "U").charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {(opportunity.profiles.full_name || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <p className="font-medium">{opportunity.profiles.full_name || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground">
                Posted on {format(new Date(opportunity.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
