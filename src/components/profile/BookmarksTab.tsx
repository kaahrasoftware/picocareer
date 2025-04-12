import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GraduationCap, User, School, BookMarked, Briefcase, BookOpen } from "lucide-react";
import { ScholarshipCard } from "@/components/scholarships/ScholarshipCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StandardPagination } from "@/components/common/StandardPagination";
import { EmptyState } from "@/components/scholarships/EmptyState";
import { MentorCard } from "@/components/MentorCard";

export function BookmarksTab() {
  const { user } = useAuthState();
  const [activeTab, setActiveTab] = useLocalStorage("bookmarks-active-tab", "mentors");
  
  const [mentorsPage, setMentorsPage] = useState(1);
  const [careersPage, setCareersPage] = useState(1);
  const [majorsPage, setMajorsPage] = useState(1);
  const [scholarshipsPage, setScholarshipsPage] = useState(1);
  
  const PAGE_SIZE = 6;

  const { data: mentorBookmarksData = { data: [], count: 0 }, isLoading: mentorsLoading } = useQuery({
    queryKey: ["bookmarked-mentors", user?.id, mentorsPage],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };

      const { count, error: countError } = await supabase
        .from("user_bookmarks")
        .select('*', { count: 'exact' })
        .eq("profile_id", user.id)
        .eq("content_type", "mentor");
      
      if (countError) throw countError;

      const start = (mentorsPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("user_bookmarks")
        .select(`
          content_id
        `)
        .eq("profile_id", user.id)
        .eq("content_type", "mentor")
        .range(start, end);

      if (error) {
        console.error("Error fetching mentor bookmarks:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const mentorIds = data.map(bookmark => bookmark.content_id);
        
        const { data: mentorProfiles, error: mentorError } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            avatar_url,
            user_type,
            position,
            bio,
            company_id,
            location,
            skills,
            keywords,
            years_of_experience,
            top_mentor,
            unique_mentees_count,
            total_sessions,
            average_rating,
            rating_count,
            reliability_score
          `)
          .in("id", mentorIds);
          
        if (mentorError) {
          console.error("Error fetching mentor profiles:", mentorError);
          throw mentorError;
        }

        const enrichedProfiles = await Promise.all(
          mentorProfiles.map(async (profile) => {
            let careerTitle = null;
            let companyName = null;
            
            if (profile.position) {
              const { data: careerData, error: careerError } = await supabase
                .from("careers")
                .select("title")
                .eq("id", profile.position)
                .single();
                
              if (!careerError && careerData) {
                careerTitle = careerData.title;
              }
            }
            
            if (profile.company_id) {
              const { data: companyData, error: companyError } = await supabase
                .from("companies")
                .select("name")
                .eq("id", profile.company_id)
                .single();
                
              if (!companyError && companyData) {
                companyName = companyData.name;
              }
            }
            
            return {
              ...profile,
              career_title: careerTitle,
              company_name: companyName
            };
          })
        );
        
        return { 
          data: enrichedProfiles, 
          count: count || 0 
        };
      }
      
      return { data: [], count: count || 0 };
    },
    enabled: !!user && activeTab === "mentors",
  });

  const { data: careerBookmarksData = { data: [], count: 0 }, isLoading: careersLoading } = useQuery({
    queryKey: ["bookmarked-careers", user?.id, careersPage],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };

      const { count, error: countError } = await supabase
        .from("user_bookmarks")
        .select('*', { count: 'exact' })
        .eq("profile_id", user.id)
        .eq("content_type", "career");
      
      if (countError) throw countError;

      const start = (careersPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("user_bookmarks")
        .select(`content_id`)
        .eq("profile_id", user.id)
        .eq("content_type", "career")
        .range(start, end);

      if (error) {
        console.error("Error fetching career bookmarks:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const careerIds = data.map(bookmark => bookmark.content_id);
        
        const { data: careers, error: careersError } = await supabase
          .from("careers")
          .select(`
            id,
            title,
            description,
            salary_range,
            image_url
          `)
          .in("id", careerIds);
          
        if (careersError) {
          console.error("Error fetching careers:", careersError);
          throw careersError;
        }
        
        return { 
          data: careers || [], 
          count: count || 0 
        };
      }
      
      return { data: [], count: count || 0 };
    },
    enabled: !!user && activeTab === "careers",
  });

  const { data: majorBookmarksData = { data: [], count: 0 }, isLoading: majorsLoading } = useQuery({
    queryKey: ["bookmarked-majors", user?.id, majorsPage],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };

      const { count, error: countError } = await supabase
        .from("user_bookmarks")
        .select('*', { count: 'exact' })
        .eq("profile_id", user.id)
        .eq("content_type", "major");
      
      if (countError) throw countError;

      const start = (majorsPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("user_bookmarks")
        .select(`content_id`)
        .eq("profile_id", user.id)
        .eq("content_type", "major")
        .range(start, end);

      if (error) {
        console.error("Error fetching major bookmarks:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const majorIds = data.map(bookmark => bookmark.content_id);
        
        const { data: majors, error: majorsError } = await supabase
          .from("majors")
          .select(`
            id,
            title,
            description,
            degree_levels,
            featured
          `)
          .in("id", majorIds);
          
        if (majorsError) {
          console.error("Error fetching majors:", majorsError);
          throw majorsError;
        }
        
        return { 
          data: majors || [], 
          count: count || 0 
        };
      }
      
      return { data: [], count: count || 0 };
    },
    enabled: !!user && activeTab === "majors",
  });

  const { data: scholarshipBookmarksData = { data: [], count: 0 }, isLoading: scholarshipsLoading } = useQuery({
    queryKey: ["bookmarked-scholarships", user?.id, scholarshipsPage],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };

      const { count, error: countError } = await supabase
        .from("user_bookmarks")
        .select('*', { count: 'exact' })
        .eq("profile_id", user.id)
        .eq("content_type", "scholarship");
      
      if (countError) throw countError;

      const start = (scholarshipsPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("user_bookmarks")
        .select(`content_id`)
        .eq("profile_id", user.id)
        .eq("content_type", "scholarship")
        .range(start, end);

      if (error) {
        console.error("Error fetching scholarship bookmarks:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const scholarshipIds = data.map(bookmark => bookmark.content_id);
        
        const { data: scholarships, error: scholarshipsError } = await supabase
          .from("scholarships")
          .select(`*`)
          .in("id", scholarshipIds);
          
        if (scholarshipsError) {
          console.error("Error fetching scholarships:", scholarshipsError);
          throw scholarshipsError;
        }

        const transformedScholarships = scholarships.map(scholarship => {
          return {
            ...scholarship,
            eligibility_criteria: typeof scholarship.eligibility_criteria === 'string' 
              ? JSON.parse(scholarship.eligibility_criteria) 
              : scholarship.eligibility_criteria || {}
          };
        });
        
        return { 
          data: transformedScholarships || [], 
          count: count || 0 
        };
      }
      
      return { data: [], count: count || 0 };
    },
    enabled: !!user && activeTab === "scholarships",
  });

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

  useEffect(() => {
    if (activeTab === "mentors" && mentorBookmarks.length === 0 && !mentorsLoading) {
      console.log("No mentor bookmarks found");
    }
  }, [activeTab, mentorBookmarks.length, mentorsLoading]);

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
                  <MentorCard
                    key={mentor.id}
                    id={mentor.id}
                    name={mentor.full_name || ""}
                    position={mentor.career_title || ""}
                    company={mentor.company_name || ""}
                    location={mentor.location}
                    skills={mentor.skills || []}
                    keywords={mentor.keywords || []}
                    avatarUrl={mentor.avatar_url || ""}
                    hourlyRate={0}
                    topMentor={mentor.top_mentor || false}
                    menteeCount={mentor.unique_mentees_count || 0}
                    sessionsHeld={mentor.total_sessions?.toString() || "0"}
                    rating={mentor.average_rating || 0}
                    totalRatings={mentor.rating_count || 0}
                    connectionRate={mentor.reliability_score || 0}
                  />
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
