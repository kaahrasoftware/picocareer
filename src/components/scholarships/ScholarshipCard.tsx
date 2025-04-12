
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, Award, FileText, Bookmark, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { ScholarshipDetailsDialog } from "./ScholarshipDetailsDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ScholarshipCardProps {
  scholarship: {
    id: string;
    title: string;
    description: string;
    provider_name: string;
    amount: number | null;
    deadline: string | null;
    status: string;
    application_url: string | null;
    category: string[];
    tags: string[];
    featured: boolean;
    eligibility_criteria?: {
      gpa_requirement?: string;
      academic_year?: string[];
      citizenship?: string[];
      demographic?: string[];
      major?: string[];
      other?: string;
    };
    application_process?: string;
    award_frequency?: string;
    contact_email?: string;
    award_date?: string;
  };
  compact?: boolean;
}

// Helper function to get card gradient based on category
const getCardGradient = (category: string[], featured: boolean) => {
  if (featured) {
    return "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200";
  }
  
  // Different gradients based on primary category
  const primaryCategory = category[0]?.toLowerCase() || "";
  
  if (primaryCategory.includes("stem") || primaryCategory.includes("science") || primaryCategory.includes("engineering")) {
    return "bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200";
  } else if (primaryCategory.includes("art") || primaryCategory.includes("music") || primaryCategory.includes("creative")) {
    return "bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200";
  } else if (primaryCategory.includes("business") || primaryCategory.includes("entrepreneur") || primaryCategory.includes("finance")) {
    return "bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200";
  } else if (primaryCategory.includes("health") || primaryCategory.includes("medical") || primaryCategory.includes("nursing")) {
    return "bg-gradient-to-br from-red-50 to-rose-100 border-red-200";
  } else if (primaryCategory.includes("minority") || primaryCategory.includes("diversity") || primaryCategory.includes("inclusion")) {
    return "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200";
  }
  
  // Default gradient
  return "bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200";
};

export function ScholarshipCard({ scholarship, compact = false }: ScholarshipCardProps) {
  const { toast } = useToast();
  const { user } = useAuthState();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [recentlyBookmarked, setRecentlyBookmarked] = useState(false);
  const [recentBookmarks, setRecentBookmarks] = useLocalStorage<string[]>("recent-scholarship-bookmarks", []);

  // Check if scholarship is bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_bookmarks")
          .select()
          .eq("profile_id", user.id)
          .eq("content_id", scholarship.id)
          .eq("content_type", "scholarship")
          .maybeSingle();
          
        if (error) throw error;
        setIsBookmarked(!!data);
        
        // Check if this is in recently bookmarked list
        if (recentBookmarks.includes(scholarship.id)) {
          setRecentlyBookmarked(true);
          // Remove from recent bookmarks after animation
          setTimeout(() => {
            setRecentlyBookmarked(false);
            setRecentBookmarks(prev => prev.filter(id => id !== scholarship.id));
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      }
    };
    
    checkBookmarkStatus();
  }, [user, scholarship.id, recentBookmarks]);

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark scholarships.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!isBookmarked) {
        await supabase.from("user_bookmarks").insert({
          profile_id: user.id,
          content_id: scholarship.id,
          content_type: "scholarship",
        });
        setIsBookmarked(true);
        
        // Add to recent bookmarks for animation
        setRecentBookmarks(prev => [...prev, scholarship.id]);
        setRecentlyBookmarked(true);
        
        toast({
          title: "Scholarship bookmarked",
          description: "This scholarship has been added to your bookmarks.",
        });
        
        // Remove animation after delay
        setTimeout(() => {
          setRecentlyBookmarked(false);
        }, 2000);
      } else {
        await supabase
          .from("user_bookmarks")
          .delete()
          .eq("profile_id", user.id)
          .eq("content_id", scholarship.id)
          .eq("content_type", "scholarship");
        setIsBookmarked(false);
        
        toast({
          title: "Bookmark removed",
          description: "This scholarship has been removed from your bookmarks.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark.",
        variant: "destructive",
      });
    }
  };

  // Get card gradient based on category
  const cardGradient = getCardGradient(scholarship.category, scholarship.featured);

  // Format deadline display
  const getDeadlineDisplay = () => {
    if (!scholarship.deadline) return null;
    
    const deadlineDate = new Date(scholarship.deadline);
    const now = new Date();
    
    if (deadlineDate < now) {
      return <span className="text-red-600 font-medium">Deadline passed</span>;
    }
    
    const timeUntil = formatDistanceToNow(deadlineDate, { addSuffix: true });
    
    // If deadline is within 2 weeks, show as urgent
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    
    if (deadlineDate <= twoWeeksFromNow) {
      return <span className="text-red-600 font-medium">Due {timeUntil}</span>;
    }
    
    return <span>Due {timeUntil}</span>;
  };

  if (compact) {
    return (
      <>
        <Card 
          className={cn(
            "h-full transition-all duration-300 hover:shadow-md overflow-hidden border", 
            cardGradient,
            "hover:translate-y-[-2px]"
          )}
        >
          <CardHeader className="pb-2 relative">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold line-clamp-1">{scholarship.title}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7 absolute top-2 right-2 transition-all duration-300",
                        isBookmarked && "text-blue-600",
                        recentlyBookmarked && "animate-[pulse_0.5s_ease-out]"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark();
                      }}
                    >
                      <Bookmark className={`h-4 w-4 transition-all ${isBookmarked ? "fill-blue-600 scale-110" : ""}`} />
                      <span className="sr-only">{isBookmarked ? "Remove bookmark" : "Bookmark scholarship"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isBookmarked ? "Remove bookmark" : "Save for later"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">{scholarship.provider_name}</p>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="flex justify-between items-center gap-2 mt-2">
              {scholarship.amount ? (
                <div className="flex items-center gap-1 font-medium text-blue-800">
                  <Award className="h-3.5 w-3.5" />
                  <span>${scholarship.amount.toLocaleString()}</span>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">Amount varies</p>
              )}
              
              {scholarship.deadline && (
                <div className="flex items-center text-xs">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>{getDeadlineDisplay()}</span>
                </div>
              )}
            </div>
            
            {scholarship.featured && (
              <Badge className="mt-3 bg-amber-500 hover:bg-amber-600 text-white border-none">
                Featured
              </Badge>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-blue-600 hover:text-blue-800 hover:bg-transparent"
              onClick={() => setDetailsDialogOpen(true)}
            >
              <FileText className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </CardFooter>
        </Card>

        <ScholarshipDetailsDialog 
          scholarship={scholarship}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <Card 
        className={cn(
          "h-full transition-all duration-300 hover:shadow-md overflow-hidden",
          cardGradient,
          "hover:translate-y-[-3px]"
        )}
      >
        <CardHeader className="relative">
          <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold pr-8">{scholarship.title}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 absolute top-3 right-3 transition-all duration-300",
                        isBookmarked && "text-blue-600",
                        recentlyBookmarked && "animate-[pulse_0.5s_ease-out]"
                      )}
                      onClick={handleBookmark}
                    >
                      <Bookmark className={`h-5 w-5 transition-all ${isBookmarked ? "fill-blue-600 scale-110" : ""}`} />
                      <span className="sr-only">{isBookmarked ? "Remove bookmark" : "Bookmark scholarship"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isBookmarked ? "Remove bookmark" : "Save for later"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-muted-foreground">{scholarship.provider_name}</p>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {scholarship.featured && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">
                Featured
              </Badge>
            )}
            {scholarship.status !== "Active" && (
              <Badge variant={scholarship.status === "Coming Soon" ? "outline" : "secondary"}>
                {scholarship.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="mb-4 line-clamp-2 text-gray-700">{scholarship.description.replace(/<[^>]*>?/gm, '')}</p>
          
          <div className="grid grid-cols-2 gap-y-2 mb-4">
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-blue-600" />
              <span className="font-medium">
                {scholarship.amount ? `$${scholarship.amount.toLocaleString()}` : "Amount varies"}
              </span>
            </div>
            
            {scholarship.deadline && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-red-600" />
                {getDeadlineDisplay()}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-3">
            {scholarship.category?.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {cat}
              </Badge>
            ))}
            {scholarship.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-800">
                {tag}
              </Badge>
            ))}
            {(scholarship.category?.length > 2 || scholarship.tags?.length > 2) && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                +more
              </Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between gap-2 border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => setDetailsDialogOpen(true)}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-1" /> View Details
          </Button>
          
          {scholarship.application_url && (
            <Button size="sm" className="flex-1" asChild>
              <a href={scholarship.application_url} target="_blank" rel="noopener noreferrer">
                Apply <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>

      <ScholarshipDetailsDialog 
        scholarship={scholarship}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </>
  );
}
