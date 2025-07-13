
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookmarksList } from "./BookmarksList";
import { ModernMajorCard } from "./ModernMajorCard";
import { MajorProfile, MajorBookmarksProps } from "./types";

export function MajorBookmarks({ activePage, onViewMajorDetails }: MajorBookmarksProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const { data: bookmarksData, isLoading } = useQuery({
    queryKey: ['major-bookmarks', session?.user?.id, currentPage],
    queryFn: async () => {
      if (!session?.user?.id) return { data: [], count: 0 };
      
      const { count, error: countError } = await supabase
        .from('user_bookmarks')
        .select('*', { count: 'exact' })
        .eq('profile_id', session.user.id)
        .eq('content_type', 'major');

      if (countError) throw countError;

      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          content_id
        `)
        .eq('profile_id', session.user.id)
        .eq('content_type', 'major')
        .range(start, end);

      if (error) throw error;

      // Get major details separately
      const majorIds = data?.map(bookmark => bookmark.content_id) || [];
      if (majorIds.length === 0) {
        return { data: [], count: count || 0 };
      }

      const { data: majorsData, error: majorsError } = await supabase
        .from('majors')
        .select('*')
        .in('id', majorIds);

      if (majorsError) throw majorsError;

      const majors: MajorProfile[] = (data || []).map(bookmark => {
        const major = majorsData?.find(m => m.id === bookmark.content_id);
        return {
          id: major?.id || bookmark.content_id,
          title: major?.title || 'Unknown Major',
          description: major?.description || '',
          degree_levels: major?.degree_levels || [],
          featured: major?.featured || false,
          potential_salary: major?.potential_salary || '',
          skill_match: major?.skill_match || [],
          tools_knowledge: major?.tools_knowledge || [],
          common_courses: major?.common_courses || [],
          profiles_count: major?.profiles_count || 0,
          learning_objectives: major?.learning_objectives || [],
          interdisciplinary_connections: major?.interdisciplinary_connections || [],
          job_prospects: major?.job_prospects || '',
          certifications_to_consider: major?.certifications_to_consider || [],
          affiliated_programs: major?.affiliated_programs || [],
          gpa_expectations: major?.gpa_expectations || 0,
          transferable_skills: major?.transferable_skills || [],
          passion_for_subject: major?.passion_for_subject || '',
          professional_associations: major?.professional_associations || [],
          global_applicability: major?.global_applicability || '',
          common_difficulties: major?.common_difficulties || [],
          career_opportunities: major?.career_opportunities || [],
          intensity: major?.intensity || '',
          stress_level: major?.stress_level || '',
          dropout_rates: major?.dropout_rates || '',
          majors_to_consider_switching_to: major?.majors_to_consider_switching_to || [],
          created_at: major?.created_at || '',
          updated_at: major?.updated_at || '',
          bookmark_id: bookmark.id
        };
      });

      return { data: majors, count: count || 0 };
    },
    enabled: !!session?.user?.id && activePage === 'majors',
  });

  const bookmarks = bookmarksData?.data || [];
  const totalCount = bookmarksData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderMajorCard = (major: MajorProfile) => (
    <ModernMajorCard 
      key={major.id} 
      major={major} 
      onView={onViewMajorDetails} 
    />
  );

  return (
    <BookmarksList
      bookmarks={bookmarks}
      isLoading={isLoading}
      emptyStateProps={{
        icon: <Bookmark className="h-8 w-8 text-primary" />,
        linkPath: "/majors",
        type: "majors"
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
