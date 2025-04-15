import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, Award, FileText, Bookmark, ExternalLink, CheckCircle } from "lucide-react";
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
    return "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-200 dark:border-amber-700/50";
  }

  // Different gradients based on primary category
  const primaryCategory = category[0]?.toLowerCase() || "";
  if (primaryCategory.includes("stem") || primaryCategory.includes("science") || primaryCategory.includes("engineering")) {
    return "bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-200 dark:border-blue-700/50";
  } else if (primaryCategory.includes("art") || primaryCategory.includes("music") || primaryCategory.includes("creative")) {
    return "bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-purple-800/20 border-purple-200 dark:border-purple-700/50";
  } else if (primaryCategory.includes("business") || primaryCategory.includes("entrepreneur") || primaryCategory.includes("finance")) {
    return "bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700/50";
  } else if (primaryCategory.includes("health") || primaryCategory.includes("medical") || primaryCategory.includes("nursing")) {
    return "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-red-800/20 border-red-200 dark:border-red-700/50";
  } else if (primaryCategory.includes("minority") || primaryCategory.includes("diversity") || primaryCategory.includes("inclusion")) {
    return "bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/30 dark:to-amber-800/20 border-orange-200 dark:border-orange-700/50";
  }

  // Default gradient
  return "bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/30 dark:to-blue-800/20 border-indigo-200 dark:border-indigo-700/50";
};
export function ScholarshipCard({
  scholarship,
  compact = false
}: ScholarshipCardProps) {
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuthState();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [recentlyBookmarked, setRecentlyBookmarked] = useState(false);
  const [recentBookmarks, setRecentBookmarks] = useLocalStorage<string[]>("recent-scholarship-bookmarks", []);
  const [isHovered, setIsHovered] = useState(false);

  // Check if scholarship is bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user) return;
      try {
        const {
          data,
          error
        } = await supabase.from("user_bookmarks").select().eq("profile_id", user.id).eq("content_id", scholarship.id).eq("content_type", "scholarship").maybeSingle();
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
  }, [user, scholarship.id, recentBookmarks, setRecentBookmarks]);
  const handleBookmark = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark scholarships.",
        variant: "destructive"
      });
      return;
    }
    try {
      if (!isBookmarked) {
        await supabase.from("user_bookmarks").insert({
          profile_id: user.id,
          content_id: scholarship.id,
          content_type: "scholarship"
        });
        setIsBookmarked(true);

        // Add to recent bookmarks for animation
        setRecentBookmarks(prev => [...prev, scholarship.id]);
        setRecentlyBookmarked(true);
        toast({
          title: "Scholarship bookmarked",
          description: "This scholarship has been added to your bookmarks."
        });

        // Remove animation after delay
        setTimeout(() => {
          setRecentlyBookmarked(false);
        }, 2000);
      } else {
        await supabase.from("user_bookmarks").delete().eq("profile_id", user.id).eq("content_id", scholarship.id).eq("content_type", "scholarship");
        setIsBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: "This scholarship has been removed from your bookmarks."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark.",
        variant: "destructive"
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
    const timeUntil = formatDistanceToNow(deadlineDate, {
      addSuffix: true
    });

    // If deadline is within 2 weeks, show as urgent
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    if (deadlineDate <= twoWeeksFromNow) {
      return <span className="text-red-600 font-medium">Due {timeUntil}</span>;
    }
    return <span>Due {timeUntil}</span>;
  };
  const openDetailsDialog = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDetailsDialogOpen(true);
  };
  if (compact) {
    return <>
        <Card className={cn("h-full transition-all duration-300 overflow-hidden border cursor-pointer group", cardGradient, "transform hover:translate-y-[-4px] hover:shadow-lg", isHovered && "ring-2 ring-primary/40")} onClick={openDetailsDialog} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <CardHeader className="pb-2 relative">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">{scholarship.title}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("h-7 w-7 absolute top-2 right-2 transition-all duration-300", isBookmarked ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground", recentlyBookmarked && "animate-[pulse_0.5s_ease-out]")} onClick={handleBookmark}>
                      <Bookmark className={`h-4 w-4 transition-all ${isBookmarked ? "fill-primary stroke-primary scale-110" : ""}`} />
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
              {scholarship.amount ? <div className="flex items-center gap-1 font-medium text-blue-700 dark:text-blue-400">
                  <Award className="h-3.5 w-3.5" />
                  <span>${scholarship.amount.toLocaleString()}</span>
                </div> : <p className="text-muted-foreground text-xs">Amount varies</p>}
              
              {scholarship.deadline && <div className="flex items-center text-xs">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>{getDeadlineDisplay()}</span>
                </div>}
            </div>
            
            {scholarship.featured && <Badge className="mt-3 bg-amber-500 hover:bg-amber-600 text-white border-none">
                Featured
              </Badge>}
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent group-hover:underline" onClick={openDetailsDialog}>
              <FileText className="h-4 w-4 mr-1 group-hover:animate-pulse" />
              View Details
            </Button>
          </CardFooter>
          
          {/* Subtle highlight effect on hover */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          {/* Featured indicator */}
          {scholarship.featured && <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-amber-500/80 border-r-transparent transform rotate-0 -translate-y-0 translate-x-0" />}
        </Card>

        <ScholarshipDetailsDialog scholarship={scholarship} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} />
      </>;
  }
  return <>
      <Card className={cn("h-full transition-all duration-300 overflow-hidden border cursor-pointer group", cardGradient, "transform hover:translate-y-[-4px] hover:shadow-lg", isHovered && "ring-2 ring-primary/40")} onClick={openDetailsDialog} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <CardHeader className="relative pt-6 pb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold pr-8 group-hover:text-primary transition-colors duration-300 text-base">
                {scholarship.title}
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("h-8 w-8 absolute top-3 right-3 transition-all duration-300", isBookmarked ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground", recentlyBookmarked && "animate-[pulse_0.5s_ease-out]")} onClick={handleBookmark}>
                      <Bookmark className={`h-5 w-5 transition-all ${isBookmarked ? "fill-primary stroke-primary scale-110" : ""}`} />
                      <span className="sr-only">{isBookmarked ? "Remove bookmark" : "Bookmark scholarship"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isBookmarked ? "Remove bookmark" : "Save for later"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="font-thin text-picocareer-black text-sm text-left">{scholarship.provider_name}</p>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {scholarship.featured && <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none flex items-center gap-1">
                <Award className="h-3 w-3" /> Featured
              </Badge>}
            {scholarship.status !== "Active" && <Badge variant={scholarship.status === "Coming Soon" ? "outline" : "secondary"}>
                {scholarship.status}
              </Badge>}
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <p className="mb-4 line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">
            {scholarship.description.replace(/<[^>]*>?/gm, '')}
          </p>
          
          <div className="grid grid-cols-2 gap-y-2 mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full mr-2">
                <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-bold text-blue-500">
                {scholarship.amount ? `$${scholarship.amount.toLocaleString()}` : "Amount varies"}
              </span>
            </div>
            
            {scholarship.deadline && <div className="flex items-center">
                <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-full mr-2">
                  <CalendarIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                {getDeadlineDisplay()}
              </div>}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-3">
            {scholarship.category?.slice(0, 2).map(cat => <Badge key={cat} variant="outline" className="bg-background/80 text-primary border-primary/30 hover:bg-primary/10">
                {cat}
              </Badge>)}
            {scholarship.tags?.slice(0, 2).map(tag => <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground">
                {tag}
              </Badge>)}
            {(scholarship.category?.length > 2 || scholarship.tags?.length > 2) && <Badge variant="secondary" className="bg-muted text-muted-foreground">
                +more
              </Badge>}
          </div>
          
          {/* Eligibility preview (simplified) */}
          {scholarship.eligibility_criteria && <div className="mt-4 text-xs text-muted-foreground">
              
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {scholarship.eligibility_criteria.gpa_requirement && <li>GPA: {scholarship.eligibility_criteria.gpa_requirement}+</li>}
                {scholarship.eligibility_criteria.academic_year?.length > 0 && <li>Year: {scholarship.eligibility_criteria.academic_year.slice(0, 2).join(", ")}{scholarship.eligibility_criteria.academic_year.length > 2 ? "..." : ""}</li>}
                {scholarship.eligibility_criteria.major?.length > 0 && <li>Major: {scholarship.eligibility_criteria.major.slice(0, 1).join(", ")}{scholarship.eligibility_criteria.major.length > 1 ? "..." : ""}</li>}
              </ul>
            </div>}
        </CardContent>
        
        <CardFooter className="flex justify-between gap-2 border-t pt-3 pb-4">
          <Button variant="outline" onClick={openDetailsDialog} className="flex-1 group-hover:border-primary/50 transition-colors">
            <FileText className="h-4 w-4 mr-1 group-hover:text-primary" /> Details
          </Button>
          
          {scholarship.application_url && <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" asChild>
              <a href={scholarship.application_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                Apply <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>}
        </CardFooter>
        
        {/* Subtle highlight effect on hover */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        {/* Featured indicator */}
        {scholarship.featured && <div className="absolute top-0 right-0 w-0 h-0 border-t-[60px] border-r-[60px] border-t-amber-500/80 border-r-transparent transform rotate-0 -translate-y-0 translate-x-0" />}
      </Card>

      <ScholarshipDetailsDialog scholarship={scholarship} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} />
    </>;
}