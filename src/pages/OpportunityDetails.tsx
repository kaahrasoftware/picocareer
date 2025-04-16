import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  CalendarClock, 
  MapPin, 
  Globe, 
  BookmarkPlus, 
  Bookmark, 
  Share2, 
  ArrowLeft,
  Clock,
  Building,
  ExternalLink,
  Users,
  Eye,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { useOpportunity } from "@/hooks/useOpportunity";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ApplicationForm } from "@/components/opportunity/ApplicationForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useBookmarkOpportunity } from "@/hooks/useBookmarkOpportunity";
import { getOpportunityTypeStyles } from "@/utils/opportunityUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
        <div className="flex flex-col gap-4 max-w-5xl mx-auto">
          <Skeleton className="h-10 w-40" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-6 w-1/3 mb-6" />
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="md:w-1/3">
              <div className="sticky top-24">
                <Skeleton className="h-72 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg shadow">
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

  const typeStyles = getOpportunityTypeStyles(opportunity.opportunity_type);

  const analytics = (opportunity as any).analytics || {
    views_count: 0,
    applications_count: 0,
    bookmarks_count: 0
  };

  const postedDate = format(new Date(opportunity.created_at), "MMM d, yyyy");

  return (
    <div className="container px-4 py-8 mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto"
      >
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-1 group"
          onClick={() => navigate("/opportunities")}
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Opportunities</span>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  className={cn(
                    "capitalize font-medium",
                    typeStyles.bg,
                    typeStyles.text,
                    typeStyles.border,
                    typeStyles.hoverBg,
                    "border"
                  )}
                >
                  {opportunity.opportunity_type}
                </Badge>
                
                {opportunity.featured && (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                    Featured
                  </Badge>
                )}
                
                {opportunity.remote && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Remote
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold">{opportunity.title}</h1>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={opportunity.profiles?.avatar_url || ''} />
                  <AvatarFallback>{opportunity.profiles?.full_name?.[0] || opportunity.provider_name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{opportunity.provider_name}</span>
                <span className="text-sm">• Posted on {postedDate}</span>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                {opportunity.deadline && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span>Deadline: <span className="font-medium">{formatDate(opportunity.deadline)}</span></span>
                  </div>
                )}
                
                {opportunity.location && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{opportunity.location}</span>
                  </div>
                )}
                
                {opportunity.compensation && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{opportunity.compensation}</span>
                  </div>
                )}
              </div>
            </div>

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
                <span>{analytics.applications_count || 0} checked out</span>
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

          <div className="md:col-span-1">
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
                  <Button asChild className="w-full gap-2">
                    <a 
                      href={opportunity.application_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
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
          </div>
        </div>
      </motion.div>

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
