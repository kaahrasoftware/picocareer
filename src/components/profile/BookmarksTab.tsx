
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GraduationCap, User, School, BookMarked } from "lucide-react";
import { ScholarshipCard } from "@/components/scholarships/ScholarshipCard";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function BookmarksTab() {
  const { user } = useAuthState();
  const [activeTab, setActiveTab] = useLocalStorage("bookmarks-active-tab", "mentors");

  // Fetch bookmarked mentors
  const { data: mentorBookmarks = [], isLoading: mentorsLoading } = useQuery({
    queryKey: ["bookmarked-mentors", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: bookmarks, error } = await supabase
        .from("user_bookmarks")
        .select(`
          content_id,
          profiles:content_id (
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
        .eq("content_type", "mentor");

      if (error) throw error;
      return bookmarks
        .filter(bookmark => bookmark.profiles)
        .map(bookmark => bookmark.profiles);
    },
    enabled: !!user,
  });

  // Fetch bookmarked scholarships
  const { data: scholarshipBookmarks = [], isLoading: scholarshipsLoading } = useQuery({
    queryKey: ["bookmarked-scholarships", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: bookmarks, error } = await supabase
        .from("user_bookmarks")
        .select(`
          content_id,
          scholarships:content_id (*)
        `)
        .eq("profile_id", user.id)
        .eq("content_type", "scholarship");

      if (error) throw error;
      return bookmarks
        .filter(bookmark => bookmark.scholarships)
        .map(bookmark => bookmark.scholarships);
    },
    enabled: !!user,
  });

  // Function to render empty state with custom message
  const renderEmptyState = (type: string, icon: React.ReactNode) => (
    <Card className="text-center p-8 border-dashed bg-muted/30">
      <div className="flex flex-col items-center gap-2">
        <div className="bg-primary/10 p-3 rounded-full">
          {icon}
        </div>
        <h3 className="font-semibold text-xl mt-2">No bookmarked {type}</h3>
        <p className="text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
          You haven't bookmarked any {type} yet. When you find {type} you like, click the bookmark icon to save them here.
        </p>
        {type === "mentors" ? (
          <Button asChild>
            <Link to="/mentor">Browse Mentors</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="/scholarships">Browse Scholarships</Link>
          </Button>
        )}
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
            renderEmptyState("mentors", <User className="h-8 w-8 text-primary" />)
          ) : (
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
          )}
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-4">
          {scholarshipsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : scholarshipBookmarks.length === 0 ? (
            renderEmptyState("scholarships", <GraduationCap className="h-8 w-8 text-primary" />)
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scholarshipBookmarks.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
