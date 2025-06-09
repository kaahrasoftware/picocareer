
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow, isPast } from "date-fns";
import { BookmarkSkeleton } from "./BookmarkSkeleton";
import { EmptyBookmarks } from "./EmptyBookmarks";

interface ScholarshipProfile {
  id: string;
  title: string;
  description: string;
  provider_name: string;
  amount?: number | null;
  deadline: string;
  status: string;
  application_url?: string | null;
  category: string[];
  tags: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
  eligibility_criteria?: any;
  award_date?: string;
}

interface ScholarshipBookmarksProps {
  bookmarks: any[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function ScholarshipBookmarks({ bookmarks, onDelete, isLoading }: ScholarshipBookmarksProps) {
  const [scholarships, setScholarships] = useState<ScholarshipProfile[]>([]);
  const [loadingScholarships, setLoadingScholarships] = useState(false);

  useEffect(() => {
    const loadScholarshipData = async () => {
      if (bookmarks.length === 0) {
        setScholarships([]);
        return;
      }
      
      setLoadingScholarships(true);
      try {
        // Extract all scholarship IDs from bookmarks
        const scholarshipIds = bookmarks
          .filter(bookmark => bookmark?.content_id)
          .map(bookmark => bookmark.content_id);
        
        if (scholarshipIds.length === 0) {
          setScholarships([]);
          return;
        }

        // Fetch scholarship data
        const { data, error } = await supabase
          .from('scholarships')
          .select('*')
          .in('id', scholarshipIds);

        if (error) {
          console.error("Error loading scholarship data:", error);
          toast.error("Failed to load scholarship data");
          return;
        }

        // Cast to the correct type - this is a workaround for type issues
        // A more complete solution would involve defining shared types
        setScholarships(data as unknown as ScholarshipProfile[]);
      } catch (error) {
        console.error("Error in loadScholarshipData:", error);
        toast.error("Something went wrong while loading scholarship data");
      } finally {
        setLoadingScholarships(false);
      }
    };

    loadScholarshipData();
  }, [bookmarks]);

  const handleBookmarkDelete = async (bookmarkId: string) => {
    if (window.confirm("Remove this bookmark?")) {
      await onDelete(bookmarkId);
    }
  };

  const handleApply = (url: string | null | undefined) => {
    if (!url) {
      toast.error("Application URL not available");
      return;
    }
    window.open(url, "_blank");
  };

  if (isLoading || loadingScholarships) {
    return (
      <div className="space-y-4">
        <BookmarkSkeleton />
        <BookmarkSkeleton />
        <BookmarkSkeleton />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return <EmptyBookmarks type="scholarships" />;
  }

  if (scholarships.length === 0) {
    return <EmptyBookmarks type="scholarships" message="No scholarships found from your bookmarks." />;
  }

  return (
    <div className="space-y-4">
      {scholarships.map((scholarship) => {
        // Find the bookmark object for this scholarship
        const bookmark = bookmarks.find(bm => bm.content_id === scholarship.id);
        const isDeadlinePassed = scholarship.deadline ? isPast(new Date(scholarship.deadline)) : false;
        
        return (
          <div key={scholarship.id} className="relative group">
            {bookmark && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={() => handleBookmarkDelete(bookmark.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{scholarship.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provider: {scholarship.provider_name}
                    </p>
                  </div>
                  <Badge variant={isDeadlinePassed ? "destructive" : "outline"}>
                    {isDeadlinePassed 
                      ? "Deadline Passed" 
                      : `Deadline: ${formatDistanceToNow(new Date(scholarship.deadline), { addSuffix: true })}`
                    }
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 line-clamp-2">{scholarship.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {scholarship.category?.slice(0, 3).map((cat, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  {scholarship.amount && (
                    <p className="text-lg font-bold">
                      ${scholarship.amount.toLocaleString()}
                    </p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleApply(scholarship.application_url)}
                    disabled={isDeadlinePassed}
                    className="flex items-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
