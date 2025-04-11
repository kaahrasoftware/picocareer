
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, Award, ArrowUpRight, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";

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
  };
  compact?: boolean;
}

export function ScholarshipCard({ scholarship, compact = false }: ScholarshipCardProps) {
  const { toast } = useToast();
  const { user } = useAuthState();
  const [isBookmarked, setIsBookmarked] = useState(false);

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
          <p className="text-sm line-clamp-2">{scholarship.description}</p>
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
      </Card>
    );
  }

  return (
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
        <p className="mb-4">{scholarship.description}</p>
        
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
          {scholarship.category?.map((cat) => (
            <Badge key={cat} variant="outline" className="bg-blue-50">
              {cat}
            </Badge>
          ))}
          {scholarship.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-800">
              {tag}
            </Badge>
          ))}
          {scholarship.tags?.length > 3 && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              +{scholarship.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" className="w-1/2 mr-1">
          View Details
        </Button>
        {scholarship.application_url && (
          <Button className="w-1/2 ml-1" asChild>
            <a href={scholarship.application_url} target="_blank" rel="noopener noreferrer">
              Apply <ArrowUpRight className="h-4 w-4 ml-1" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
