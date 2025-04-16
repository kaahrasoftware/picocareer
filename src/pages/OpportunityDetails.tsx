import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, MapPin, Globe, BookmarkPlus, Bookmark, Share2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useOpportunity } from "@/hooks/useOpportunity";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ApplicationForm } from "@/components/opportunity/ApplicationForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useBookmarkOpportunity } from "@/hooks/useBookmarkOpportunity";

export default function OpportunityDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: opportunity, isLoading, error } = useOpportunity(id as string);
  const { session } = useAuthSession();
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark, isLoading: bookmarkLoading } = useBookmarkOpportunity(id);

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error loading opportunity</h2>
          <p className="mt-2 text-muted-foreground">
            There was an error loading this opportunity. Please try again later.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/opportunities")}>
            Back to Opportunities
          </Button>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for this opportunity",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setApplyDialogOpen(true);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this opportunity: ${opportunity.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: opportunity.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Link copied",
          description: "Opportunity link has been copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "Link copied",
        description: "Opportunity link has been copied to clipboard",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const analytics = (opportunity as any).analytics || {
    views_count: 0,
    applications_count: 0,
    bookmarks_count: 0
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-1"
        onClick={() => navigate("/opportunities")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Opportunities
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="uppercase">{opportunity.opportunity_type}</Badge>
            {opportunity.featured && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                Featured
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">{opportunity.provider_name}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            {opportunity.deadline && (
              <div className="flex items-center gap-1 text-sm">
                <CalendarClock className="h-4 w-4" />
                <span>Deadline: {formatDate(opportunity.deadline)}</span>
              </div>
            )}
            
            {opportunity.location && (
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{opportunity.location}</span>
              </div>
            )}
            
            {opportunity.remote && (
              <div className="flex items-center gap-1 text-sm">
                <Globe className="h-4 w-4" />
                <span>Remote</span>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <div dangerouslySetInnerHTML={{ __html: opportunity.description }} />
          </div>

          {opportunity.categories && opportunity.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {opportunity.categories.map((category) => (
                <Badge key={category} variant="secondary">{category}</Badge>
              ))}
            </div>
          )}

          {opportunity.tags && opportunity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {opportunity.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div>{analytics.views_count || 0} views</div>
            <div>{analytics.applications_count || 0} applications</div>
            <div>{analytics.bookmarks_count || 0} bookmarks</div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-muted p-6 rounded-lg sticky top-24">
            {opportunity.compensation && (
              <div className="mb-4">
                <h3 className="font-medium mb-1">Compensation</h3>
                <p>{opportunity.compensation}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              {opportunity.application_url ? (
                <Button asChild className="w-full">
                  <a 
                    href={opportunity.application_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Check it out
                  </a>
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleApply}
                >
                  Apply Now
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => toggleBookmark()}
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
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {opportunity.profiles && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium mb-2">Posted by</h3>
                <div className="flex items-center gap-3">
                  {opportunity.profiles.avatar_url ? (
                    <img 
                      src={opportunity.profiles.avatar_url} 
                      alt={opportunity.profiles.full_name || "User"} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {(opportunity.profiles.full_name || "U").charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{opportunity.profiles.full_name || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">
                      Posted on {format(new Date(opportunity.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <ApplicationForm 
            opportunityId={opportunity.id} 
            opportunityTitle={opportunity.title}
            onComplete={() => setApplyDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
