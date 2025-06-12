
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, GraduationCap, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookmarksList } from "./BookmarksList";
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
          content_id,
          majors (
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
          )
        `)
        .eq('profile_id', session.user.id)
        .eq('content_type', 'major')
        .range(start, end);

      if (error) throw error;

      const majors: MajorProfile[] = (data || []).map(bookmark => ({
        id: bookmark.majors?.id || bookmark.content_id,
        title: bookmark.majors?.title || 'Unknown Major',
        description: bookmark.majors?.description || '',
        degree_levels: bookmark.majors?.degree_levels || [],
        featured: bookmark.majors?.featured || false,
        potential_salary: bookmark.majors?.potential_salary || '',
        skill_match: bookmark.majors?.skill_match || [],
        tools_knowledge: bookmark.majors?.tools_knowledge || [],
        common_courses: bookmark.majors?.common_courses || [],
        profiles_count: bookmark.majors?.profiles_count || 0,
        learning_objectives: bookmark.majors?.learning_objectives || [],
        interdisciplinary_connections: bookmark.majors?.interdisciplinary_connections || [],
        job_prospects: bookmark.majors?.job_prospects || '',
        certifications_to_consider: bookmark.majors?.certifications_to_consider || [],
        affiliated_programs: bookmark.majors?.affiliated_programs || [],
        gpa_expectations: bookmark.majors?.gpa_expectations || 0,
        transferable_skills: bookmark.majors?.transferable_skills || [],
        passion_for_subject: bookmark.majors?.passion_for_subject || '',
        professional_associations: bookmark.majors?.professional_associations || [],
        global_applicability: bookmark.majors?.global_applicability || '',
        common_difficulties: bookmark.majors?.common_difficulties || [],
        career_opportunities: bookmark.majors?.career_opportunities || [],
        intensity: bookmark.majors?.intensity || '',
        stress_level: bookmark.majors?.stress_level || '',
        dropout_rates: bookmark.majors?.dropout_rates || '',
        majors_to_consider_switching_to: bookmark.majors?.majors_to_consider_switching_to || [],
        created_at: bookmark.majors?.created_at || '',
        updated_at: bookmark.majors?.updated_at || '',
        bookmark_id: bookmark.id
      }));

      return { data: majors, count: count || 0 };
    },
    enabled: !!session?.user?.id && activePage === 'majors',
  });

  const bookmarks = bookmarksData?.data || [];
  const totalCount = bookmarksData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderMajorCard = (major: MajorProfile) => (
    <Card key={major.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{major.title}</CardTitle>
          {major.featured && <Star className="h-4 w-4 text-yellow-500" />}
        </div>
        {major.degree_levels && major.degree_levels.length > 0 && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {major.degree_levels.join(", ")}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {major.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {major.description}
          </p>
        )}
        {major.potential_salary && (
          <p className="text-xs text-muted-foreground mb-2">
            Potential Salary: {major.potential_salary}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Users className="h-3 w-3" />
            {major.profiles_count || 0} students
          </Badge>
          <Button variant="outline" size="sm" onClick={() => onViewMajorDetails(major)}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
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
