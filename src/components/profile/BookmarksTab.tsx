
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GraduationCap, User, School, BookMarked, Briefcase, BookOpen } from "lucide-react";
import { ScholarshipCard } from "@/components/scholarships/ScholarshipCard";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StandardPagination } from "@/components/common/StandardPagination";
import { EmptyState } from "@/components/scholarships/EmptyState";

export function BookmarksTab() {
  const { user } = useAuthState();
  const [activeTab, setActiveTab] = useLocalStorage("bookmarks-active-tab", "mentors");
  
  // Pagination states
  const [mentorsPage, setMentorsPage] = useState(1);
  const [careersPage, setCareersPage] = useState(1);
  const [majorsPage, setMajorsPage] = useState(1);
  const [scholarshipsPage, setScholarshipsPage] = useState(1);
  
  const PAGE_SIZE = 6;

  // Fetch bookmarked mentors with pagination
  const { data: mentorBookmarksData = { data: [], count: 0 }, isLoading: mentorsLoading } = useQuery({
    queryKey: ["bookmarked-mentors", user?.id, mentorsPage],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };

      // Get total count first
      const { count, error: countError } = await supabase
        .from("user_bookmarks")
        .select('*', { count: 'exact' })
        .eq("profile_id", user.id)
        .eq("content_type", "mentor");
      
      if (countError) throw countError;

      // Get paginated data
      const start = (mentorsPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data: bookmarks, error } = await supabase
        .from("user_bookmarks")
        .select(`
          content_id,
          mentor:profiles!content_id(
            id,
            full_name,
            avatar_url,
            user_type,
            position,
            company_name,
            school_name,
            bio
          )
        `)
        .eq("profile_id", user.id)
        .eq("content_type", "mentor")
        .range(start, end);

      if (error) throw error;
      
      const filteredData = bookmarks
        .filter(bookmark => bookmark.mentor)
        .map(bookmark => bookmark.mentor);
      
      return { 
        data: filteredData, 
        count: count || 0 
      };
    },
    enabled: !!user && activeTab === "mentors",
  });

  // Fetch bookmarked careers with pagination
  const { data: careerBookmarksData = { data: [], count: 0 }, isLoading: careersLoading } = useQuery({
    queryKey: ["bookmarked-careers", user?.id, careersPage],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };

      // Get total count first
      const { count, error: countError } = await supabase
        .from("user_bookmarks")
        .select('*', { count: 'exact' })
        .eq("profile_id", user.id)
        .eq("content_type", "career");
      
      if (countError) throw countError;

      // Get paginated data
      const start = (careersPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data: bookmarks, error } = await supabase
        .from("user_bookmarks")
        .select(`
          content_id,
          career:careers!content_id(
            id,
            title,
            description,
            salary_range,
            image_url
          )
        `)
        .eq("profile_id", user.id)
        .eq("content_type", "career")
        .range(start, end);

      if (error) throw error;
      
      const filteredData = bookmarks
        .filter(bookmark => bookmark.career)
        .map(bookmark => bookmark.career);
      
      return { 
        data: filteredData, 
        count: count || 0 
      };
    },
    enabled: !!user && activeTab === "careers",
  });

  // Fetch bookmarked academic majors with pagination
  const { data: majorBookmarksData = { data: [], count: 0 }, isLoading: majorsLoading } = useQuery({
    queryKey: ["bookmarked-majors", user?.id, majorsPage],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };

      // Get total count first
      const { count, error: countError } = await supabase
        .from("user_bookmarks")
        .select('*', { count: 'exact' })
        .eq("profile_id", user.id)
        .eq("content_type", "major");
      
      if (countError) throw countError;

      // Get paginated data
      const start = (majorsPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data: bookmarks, error } = await supabase
        .from("user_bookmarks")
        .select(`
          content_id,
          major:majors!content_id(
            id,
            title,
            description,
            degree_levels,
            featured
          )
        `)
        .eq("profile_id", user.id)
        .eq("content_type", "major")
        .range(start, end);

      if (error) throw error;
      
      const filteredData = bookmarks
        .filter(bookmark => bookmark.major)
        .map(bookmark => bookmark.major);
      
      return { 
        data: filteredData, 
        count: count || 0 
      };
    },
    enabled: !!user && activeTab === "majors",
  });

  // Fetch bookmarked scholarships with pagination
  const { data: scholarshipBookmarksData = { data: [], count: 0 }, isLoading: scholarshipsLoading } = useQuery({
    queryKey: ["bookmarked-scholarships", user?.id, scholarshipsPage],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };

      // Get total count first
      const { count, error: countError } = await supabase
        .from("user_bookmarks")
        .select('*', { count: 'exact' })
        .eq("profile_id", user.id)
        .eq("content_type", "scholarship");
      
      if (countError) throw countError;

      // Get paginated data
      const start = (scholarshipsPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data: bookmarks, error } = await supabase
        .from("user_bookmarks")
        .select(`
          content_id,
          scholarship:scholarships!content_id(*)
        `)
        .eq("profile_id", user.id)
        .eq("content_type", "scholarship")
        .range(start, end);

      if (error) throw error;
      
      const filteredData = bookmarks
        .filter(bookmark => bookmark.scholarship)
        .map(bookmark => bookmark.scholarship);
      
      return { 
        data: filteredData, 
        count: count || 0 
      };
    },
    enabled: !!user && activeTab === "scholarships",
  });

  // Extract the data arrays and counts
  const mentorBookmarks = mentorBookmarksData?.data || [];
  const mentorsTotalCount = mentorBookmarksData?.count || 0;
  const mentorsTotalPages = Math.ceil(mentorsTotalCount / PAGE_SIZE);

  const careerBookmarks = careerBookmarksData?.data || [];
  const careersTotalCount = careerBookmarksData?.count || 0;
  const careersTotalPages = Math.ceil(careersTotalCount / PAGE_SIZE);

  const majorBookmarks = majorBookmarksData?.data || [];
  const majorsTotalCount = majorBookmarksData?.count || 0;
  const majorsTotalPages = Math.ceil(majorsTotalCount / PAGE_SIZE);

  const scholarshipBookmarks = scholarshipBookmarksData?.data || [];
  const scholarshipsTotalCount = scholarshipBookmarksData?.count || 0;
  const scholarshipsTotalPages = Math.ceil(scholarshipsTotalCount / PAGE_SIZE);

  // Function to render empty state with custom message
  const renderEmptyState = (type: string, icon: React.ReactNode, linkPath: string) => (
    <Card className="text-center p-8 border-dashed bg-muted/30">
      <div className="flex flex-col items-center gap-2">
        <div className="bg-primary/10 p-3 rounded-full">
          {icon}
        </div>
        <h3 className="font-semibold text-xl mt-2">No bookmarked {type}</h3>
        <p className="text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
          You haven't bookmarked any {type} yet. When you find {type} you like, click the bookmark icon to save them here.
        </p>
        <Button asChild>
          <Link to={linkPath}>Browse {type}</Link>
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookMarked className="w-6 h-6" />
          My Bookmarks
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="mentors" className="flex gap-1 items-center">
            <User className="h-4 w-4" /> Mentors
          </TabsTrigger>
          <TabsTrigger value="careers" className="flex gap-1 items-center">
            <Briefcase className="h-4 w-4" /> Careers
          </TabsTrigger>
          <TabsTrigger value="majors" className="flex gap-1 items-center">
            <BookOpen className="h-4 w-4" /> Academic Majors
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="flex gap-1 items-center">
            <School className="h-4 w-4" /> Scholarships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-4">
          {mentorsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : mentorBookmarks.length === 0 ? (
            renderEmptyState("mentors", <User className="h-8 w-8 text-primary" />, "/mentor")
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentorBookmarks.map((mentor) => (
                  <Card key={mentor.id} className="hover:shadow transition-all">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <ProfileAvatar
                        avatarUrl={mentor.avatar_url}
                        imageAlt={mentor.full_name}
                        size="md"
                      />
                      <div>
                        <CardTitle className="text-lg">{mentor.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {mentor.position} {mentor.company_name ? `at ${mentor.company_name}` : ""}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm">
                        {mentor.bio || "No bio available"}
                      </p>
                      <div className="mt-4">
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link to={`/mentor/${mentor.id}`}>View Profile</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <StandardPagination 
                currentPage={mentorsPage}
                totalPages={mentorsTotalPages}
                onPageChange={setMentorsPage}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="careers" className="space-y-4">
          {careersLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : careerBookmarks.length === 0 ? (
            renderEmptyState("careers", <Briefcase className="h-8 w-8 text-primary" />, "/career")
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {careerBookmarks.map((career) => (
                  <Card key={career.id} className="hover:shadow transition-all overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 relative">
                      {career.image_url && (
                        <img 
                          src={career.image_url} 
                          alt={career.title} 
                          className="w-full h-full object-cover absolute opacity-40"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Briefcase className="h-16 w-16 text-primary opacity-20" />
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <CardTitle className="text-lg mb-2">{career.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {career.description}
                      </p>
                      {career.salary_range && (
                        <p className="text-sm font-medium bg-primary/10 text-primary rounded-full px-3 py-0.5 inline-block mb-3">
                          {career.salary_range}
                        </p>
                      )}
                      <Button asChild variant="outline" size="sm" className="w-full mt-2">
                        <Link to={`/career/${career.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <StandardPagination 
                currentPage={careersPage}
                totalPages={careersTotalPages}
                onPageChange={setCareersPage}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="majors" className="space-y-4">
          {majorsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : majorBookmarks.length === 0 ? (
            renderEmptyState("academic majors", <BookOpen className="h-8 w-8 text-primary" />, "/majors")
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {majorBookmarks.map((major) => (
                  <Card key={major.id} className="hover:shadow transition-all">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {major.title}
                      </CardTitle>
                      {major.featured && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {major.description}
                      </p>
                      {major.degree_levels && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {Array.isArray(major.degree_levels) && major.degree_levels.slice(0, 3).map((degree, index) => (
                            <span key={index} className="bg-blue-50 text-blue-700 text-xs rounded-full px-2 py-0.5">
                              {degree}
                            </span>
                          ))}
                        </div>
                      )}
                      <Button asChild variant="outline" size="sm" className="w-full mt-2">
                        <Link to={`/majors/${major.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <StandardPagination 
                currentPage={majorsPage}
                totalPages={majorsTotalPages}
                onPageChange={setMajorsPage}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-4">
          {scholarshipsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : scholarshipBookmarks.length === 0 ? (
            renderEmptyState("scholarships", <GraduationCap className="h-8 w-8 text-primary" />, "/scholarships")
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scholarshipBookmarks.map((scholarship) => (
                  <ScholarshipCard
                    key={scholarship.id}
                    scholarship={scholarship}
                  />
                ))}
              </div>
              
              <StandardPagination 
                currentPage={scholarshipsPage}
                totalPages={scholarshipsTotalPages}
                onPageChange={setScholarshipsPage}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
