
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { ScholarshipCard } from "@/components/scholarships/ScholarshipCard";
import { ScholarshipProfile } from "./types";
import { BookmarksList } from "./BookmarksList";

interface ScholarshipBookmarksProps {
  activePage: string;
}

export function ScholarshipBookmarks({ activePage }: ScholarshipBookmarksProps) {
  const { user } = useAuthState();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Fetch bookmarked scholarships with pagination
  const scholarshipBookmarksQuery = useQuery({
    queryKey: ["bookmarked-scholarships", user?.id, currentPage],
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
      }).eq("profile_id", user.id).eq("content_type", "scholarship");
      if (countError) {
        console.error("Error counting scholarship bookmarks:", countError);
        throw countError;
      }

      // Get paginated bookmark IDs
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      const {
        data: bookmarks,
        error: bookmarksError
      } = await supabase.from("user_bookmarks").select("content_id").eq("profile_id", user.id).eq("content_type", "scholarship").range(start, end);
      if (bookmarksError) {
        console.error("Error fetching scholarship bookmarks:", bookmarksError);
        throw bookmarksError;
      }
      if (!bookmarks || bookmarks.length === 0) {
        return {
          data: [],
          count: count || 0
        };
      }

      // Get the actual scholarships data using the bookmark IDs
      const scholarshipIds = bookmarks.map(bookmark => bookmark.content_id);
      const {
        data: scholarships,
        error: scholarshipsError
      } = await supabase.from("scholarships").select("*").in("id", scholarshipIds);
      if (scholarshipsError) {
        console.error("Error fetching scholarships data:", scholarshipsError);
        throw scholarshipsError;
      }

      // Transform the data to ensure eligibility_criteria is properly structured
      const transformedData = scholarships.map(scholarship => {
        return {
          ...scholarship,
          // Ensure eligibility_criteria is properly structured
          eligibility_criteria: typeof scholarship.eligibility_criteria === 'string' ? JSON.parse(scholarship.eligibility_criteria) : scholarship.eligibility_criteria || {}
        };
      });
      return {
        data: transformedData,
        count: count || 0
      };
    },
    enabled: !!user && activePage === "scholarships"
  });

  const scholarshipBookmarks = scholarshipBookmarksQuery.data?.data || [];
  const totalCount = scholarshipBookmarksQuery.data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderScholarshipCard = (scholarship: ScholarshipProfile) => (
    <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
  );

  return (
    <BookmarksList
      bookmarks={scholarshipBookmarks}
      isLoading={scholarshipBookmarksQuery.isLoading}
      emptyStateProps={{
        icon: <GraduationCap className="h-8 w-8 text-primary" />,
        linkPath: "/scholarships",
        type: "scholarships"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={() => {}} // Scholarships use their own card with details
      renderCard={(scholarship) => renderScholarshipCard(scholarship)}
      bookmarkType="scholarship"
    />
  );
}
