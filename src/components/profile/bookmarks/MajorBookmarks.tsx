
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { MajorProfile } from "./types";
import { BookmarksList } from "./BookmarksList";

interface MajorBookmarksProps {
  activePage: string;
  onViewMajorDetails: (major: MajorProfile) => void;
}

export function MajorBookmarks({ activePage, onViewMajorDetails }: MajorBookmarksProps) {
  const { user } = useAuthState();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Fetch bookmarked academic majors with pagination
  const majorBookmarksQuery = useQuery({
    queryKey: ["bookmarked-majors", user?.id, currentPage],
    queryFn: async () => {
      if (!user) return {
        data: [],
        count: 0
      };

      // Get total count first
      const {
        count,
        error: countError
      } = await supabase.from("user_bookmarks").select('*', {
        count: 'exact'
      }).eq("profile_id", user.id).eq("content_type", "major");
      if (countError) {
        console.error("Error counting major bookmarks:", countError);
        throw countError;
      }

      // Get paginated data with proper join
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      const {
        data,
        error
      } = await supabase.from("user_bookmarks").select(`
          content_id
        `).eq("profile_id", user.id).eq("content_type", "major").range(start, end);
      if (error) {
        console.error("Error fetching major bookmarks:", error);
        throw error;
      }

      // Now fetch the actual major profiles
      if (data && data.length > 0) {
        const majorIds = data.map(bookmark => bookmark.content_id);
        const {
          data: majors,
          error: majorsError
        } = await supabase.from("majors").select(`
            id,
            title,
            description,
            degree_levels,
            featured,
            potential_salary,
            skill_match,
            tools_knowledge,
            common_courses,
            profiles_count,
            learning_objectives,
            interdisciplinary_connections,
            job_prospects,
            certifications_to_consider,
            affiliated_programs,
            gpa_expectations,
            transferable_skills,
            passion_for_subject,
            professional_associations,
            global_applicability,
            common_difficulties,
            career_opportunities,
            intensity,
            stress_level,
            dropout_rates,
            majors_to_consider_switching_to,
            created_at,
            updated_at
          `).in("id", majorIds);
        if (majorsError) {
          console.error("Error fetching majors data:", majorsError);
          throw majorsError;
        }
        return {
          data: majors || [],
          count: count || 0
        };
      }
      return {
        data: [],
        count: count || 0
      };
    },
    enabled: !!user && activePage === "majors"
  });

  const majorBookmarks = majorBookmarksQuery.data?.data || [];
  const totalCount = majorBookmarksQuery.data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderMajorCard = (major: MajorProfile, handleView: (major: MajorProfile) => void) => (
    <Card key={major.id} className="hover:shadow transition-all">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {major.title}
        </CardTitle>
        {major.featured && 
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>
        }
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {major.description}
        </p>
        {major.degree_levels && <div className="flex flex-wrap gap-1 mb-3">
            {Array.isArray(major.degree_levels) && major.degree_levels.slice(0, 3).map((degree, index) => <span key={index} className="bg-blue-50 text-blue-700 text-xs rounded-full px-2 py-0.5">
                {degree}
              </span>)}
          </div>}
        <Button 
          onClick={() => handleView(major)} 
          variant="outline" 
          size="sm" 
          className="w-full mt-2"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <BookmarksList
      bookmarks={majorBookmarks}
      isLoading={majorBookmarksQuery.isLoading}
      emptyStateProps={{
        icon: <BookOpen className="h-8 w-8 text-primary" />,
        linkPath: "/program",
        type: "academic majors"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={onViewMajorDetails}
      renderCard={renderMajorCard}
      bookmarkType="major"
    />
  );
}
