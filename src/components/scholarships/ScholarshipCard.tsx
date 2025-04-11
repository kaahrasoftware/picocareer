
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, Award, FileText, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { ScholarshipDetailsDialog } from "./ScholarshipDetailsDialog";

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

export function ScholarshipCard({ scholarship, compact = false }: ScholarshipCardProps) {
  const { toast } = useToast();
  const { user } = useAuthState();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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
        toast({
          title: "Scholarship bookmarked",
          description: "This scholarship has been added to your bookmarks.",
        });
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

  if (compact) {
    return (
      <>
        <Card className="h-full hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold line-clamp-1">{scholarship.title}</h3>
              {scholarship.featured && (
                <Badge className="bg-amber-500 hover:bg-amber-600">Featured</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{scholarship.provider_name}</p>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-between items-center mt-2">
              {scholarship.amount ? (
                <p className="font-medium">${scholarship.amount.toLocaleString()}</p>
              ) : (
                <p className="text-muted-foreground text-sm">Amount varies</p>
              )}
              
              {scholarship.deadline && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>
                    {new Date(scholarship.deadline) > new Date()
                      ? `Due ${formatDistanceToNow(new Date(scholarship.deadline), { addSuffix: true })}`
                      : "Deadline passed"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
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
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{scholarship.title}</h3>
                {scholarship.featured && (
                  <Badge className="bg-amber-500 hover:bg-amber-600">Featured</Badge>
                )}
                {scholarship.status !== "Active" && (
                  <Badge variant={scholarship.status === "Coming Soon" ? "outline" : "secondary"}>
                    {scholarship.status}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{scholarship.provider_name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              title={isBookmarked ? "Remove bookmark" : "Bookmark this scholarship"}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 line-clamp-3">{scholarship.description.replace(/<[^>]*>?/gm, '')}</p>
          
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
                <span>
                  {new Date(scholarship.deadline) > new Date()
                    ? `Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}`
                    : "Deadline passed"}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-3">
            {scholarship.category?.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="outline" className="bg-blue-50">
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
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => setDetailsDialogOpen(true)}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-1" /> View Details
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
