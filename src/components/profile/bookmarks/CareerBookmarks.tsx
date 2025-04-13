
import { useState } from "react";
import { Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { User } from "lucide-react";
import { CareerProfile } from "./types";
import { BookmarksList } from "./BookmarksList";

interface CareerBookmarksProps {
  activePage: string;
  onViewCareerDetails: (careerId: string) => void;
}

export function CareerBookmarks({ activePage, onViewCareerDetails }: CareerBookmarksProps) {
  const { user } = useAuthState();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Fetch bookmarked careers with pagination
  const careerBookmarksQuery = useQuery({
    queryKey: ["bookmarked-careers", user?.id, currentPage],
    queryFn: async () => {
      if (!user) return {
        data: [],
        count: 0
      };

      console.log("Fetching career bookmarks for user:", user.id);

      // Get total count first 
      const {
        count,
        error: countError
      } = await supabase.from("user_bookmarks").select('*', {
        count: 'exact'
      }).eq("profile_id", user.id).eq("content_type", "career");
      
      if (countError) {
        console.error("Error counting career bookmarks:", countError);
        throw countError;
      }

      // Calculate pagination offsets
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      // First get bookmark IDs
      const {
        data: bookmarks,
        error: bookmarksError
      } = await supabase.from("user_bookmarks")
        .select("content_id")
        .eq("profile_id", user.id)
        .eq("content_type", "career")
        .range(start, end);
        
      if (bookmarksError) {
        console.error("Error fetching career bookmarks:", bookmarksError);
        throw bookmarksError;
      }
      
      if (!bookmarks || bookmarks.length === 0) {
        console.log("No career bookmarks found");
        return {
          data: [],
          count: count || 0
        };
      }

      // Log the bookmarks we found
      console.log("Career bookmark IDs found:", bookmarks.map(b => b.content_id));

      // Get the actual career data using the bookmark IDs
      const careerIds = bookmarks.map(bookmark => bookmark.content_id);
      const {
        data: careers,
        error: careersError
      } = await supabase.from("careers").select(`
          id,
          title,
          description,
          salary_range,
          image_url,
          industry,
          profiles_count
        `).in("id", careerIds);
        
      if (careersError) {
        console.error("Error fetching careers data:", careersError);
        throw careersError;
      }
      
      console.log("Career data fetched:", careers);
      
      return {
        data: careers || [],
        count: count || 0
      };
    },
    enabled: !!user && activePage === "careers"
  });

  const careerBookmarks = careerBookmarksQuery.data?.data || [];
  const totalCount = careerBookmarksQuery.data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderCareerCard = (career: CareerProfile, handleView: (career: CareerProfile) => void) => (
    <Card key={career.id} className="hover:shadow transition-all overflow-hidden group">
      <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
        {career.image_url && <img src={career.image_url} alt={career.title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
          <div className="p-3 text-white">
            <h3 className="font-semibold text-lg drop-shadow-md">{career.title}</h3>
            {career.industry && <p className="text-sm opacity-90">{career.industry}</p>}
          </div>
        </div>
      </div>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {career.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          {career.salary_range && <span className="text-sm font-medium bg-primary/10 text-primary rounded-full px-3 py-0.5 inline-block">
              {career.salary_range}
            </span>}
          {career.profiles_count > 0 && <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {career.profiles_count} {career.profiles_count === 1 ? 'Mentor' : 'Mentors'}
            </span>}
        </div>
        <Button onClick={() => handleView(career)} variant="outline" size="sm" className="w-full mt-2">
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <BookmarksList
      bookmarks={careerBookmarks}
      isLoading={careerBookmarksQuery.isLoading}
      emptyStateProps={{
        icon: <Briefcase className="h-8 w-8 text-primary" />,
        linkPath: "/career",
        type: "careers"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={(career) => onViewCareerDetails(career.id)}
      renderCard={renderCareerCard}
      bookmarkType="career"
    />
  );
}
