
import { useState } from "react";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { useAuthState } from "@/hooks/useAuthState";
import { MentorProfile } from "./types";
import { BookmarksList } from "./BookmarksList";

interface MentorBookmarksProps {
  activePage: string;
  onViewMentorProfile: (mentorId: string) => void;
}

export function MentorBookmarks({ activePage, onViewMentorProfile }: MentorBookmarksProps) {
  const { user } = useAuthState();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Fetch bookmarked mentors with pagination
  const mentorBookmarksQuery = useQuery({
    queryKey: ["bookmarked-mentors", user?.id, currentPage],
    queryFn: async () => {
      if (!user) return {
        data: [],
        count: 0
      };

      // First query for total count
      const {
        count,
        error: countError
      } = await supabase.from("user_bookmarks").select('*', {
        count: 'exact'
      }).eq("profile_id", user.id).eq("content_type", "mentor");
      if (countError) throw countError;

      // Get paginated data with proper join
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      const {
        data,
        error
      } = await supabase.from("user_bookmarks").select(`
          content_id
        `).eq("profile_id", user.id).eq("content_type", "mentor").range(start, end);
      if (error) {
        console.error("Error fetching mentor bookmarks:", error);
        throw error;
      }

      // Now fetch the actual mentor profiles
      if (data && data.length > 0) {
        const mentorIds = data.map(bookmark => bookmark.content_id);
        const {
          data: mentorProfiles,
          error: mentorError
        } = await supabase.from("profiles").select(`
            id,
            full_name,
            avatar_url,
            user_type,
            position,
            bio,
            company_id,
            location,
            skills,
            top_mentor
          `).in("id", mentorIds);
        if (mentorError) {
          console.error("Error fetching mentor profiles:", mentorError);
          throw mentorError;
        }

        // Fetch company names if needed
        const companyIds = mentorProfiles.filter(profile => profile.company_id).map(profile => profile.company_id);
        let companiesData = {};
        if (companyIds.length > 0) {
          const {
            data: companies,
            error: companiesError
          } = await supabase.from("companies").select("id, name").in("id", companyIds);
          if (companiesError) {
            console.error("Error fetching companies:", companiesError);
          } else if (companies) {
            companiesData = companies.reduce((acc, company) => {
              acc[company.id] = company.name;
              return acc;
            }, {});
          }
        }

        // Fetch career titles for positions
        const careerIds = mentorProfiles.filter(profile => profile.position).map(profile => profile.position);
        let careersData = {};
        if (careerIds.length > 0) {
          const {
            data: careers,
            error: careersError
          } = await supabase.from("careers").select("id, title").in("id", careerIds);
          if (careersError) {
            console.error("Error fetching careers:", careersError);
          } else if (careers) {
            careersData = careers.reduce((acc, career) => {
              acc[career.id] = career.title;
              return acc;
            }, {});
          }
        }

        // Enrich mentor profiles with company names and career titles
        const enrichedProfiles = mentorProfiles.map(profile => ({
          ...profile,
          company_name: profile.company_id ? companiesData[profile.company_id] : null,
          career_title: profile.position ? careersData[profile.position] : null
        }));
        return {
          data: enrichedProfiles,
          count: count || 0
        };
      }
      return {
        data: [],
        count: count || 0
      };
    },
    enabled: !!user && activePage === "mentors"
  });

  const mentorBookmarks = mentorBookmarksQuery.data?.data || [];
  const totalCount = mentorBookmarksQuery.data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderMentorCard = (mentor: MentorProfile, handleView: (mentor: MentorProfile) => void) => (
    <Card key={mentor.id} className="hover:shadow transition-all">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <ProfileAvatar avatarUrl={mentor.avatar_url} imageAlt={mentor.full_name || "Mentor"} size="md" />
        <div>
          <CardTitle className="text-lg">{mentor.full_name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {mentor.career_title || "Mentor"} {mentor.company_name ? `at ${mentor.company_name}` : ""}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm">
          {mentor.bio || "No bio available"}
        </p>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full" onClick={() => handleView(mentor)}>
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <BookmarksList
      bookmarks={mentorBookmarks}
      isLoading={mentorBookmarksQuery.isLoading}
      emptyStateProps={{
        icon: <User className="h-8 w-8 text-primary" />,
        linkPath: "/mentor",
        type: "mentors"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={(mentor) => onViewMentorProfile(mentor.id)}
      renderCard={renderMentorCard}
      bookmarkType="mentor"
    />
  );
}
