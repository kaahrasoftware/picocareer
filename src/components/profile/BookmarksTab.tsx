import React from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkX } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { MajorDetails } from "@/components/MajorDetails";
import { Badge } from "@/components/ui/badge";

export function BookmarksTab() {
  const { session } = useAuthSession();
  const [selectedProfile, setSelectedProfile] = React.useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = React.useState<string | null>(null);
  const [selectedMajor, setSelectedMajor] = React.useState<string | null>(null);

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['bookmarks', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      try {
        // Get all bookmarks for the user
        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from('user_bookmarks')
          .select('content_type, content_id')
          .eq('profile_id', session.user.id);

        if (bookmarkError) {
          console.error('Error fetching bookmarks:', bookmarkError);
          return null;
        }

        if (!bookmarkData || bookmarkData.length === 0) return { mentors: [], careers: [], majors: [] };

        // Separate bookmarks by type
        const mentorIds = bookmarkData.filter(b => b.content_type === 'mentor').map(b => b.content_id);
        const careerIds = bookmarkData.filter(b => b.content_type === 'career').map(b => b.content_id);
        const majorIds = bookmarkData.filter(b => b.content_type === 'major').map(b => b.content_id);

        // Fetch mentor profiles
        const { data: mentorData } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            avatar_url,
            position,
            user_type,
            company:companies(name),
            careers!profiles_position_fkey(title)
          `)
          .in('id', mentorIds)
          .eq('user_type', 'mentor')
          .eq('onboarding_status', 'Approved');

        // Fetch careers
        const { data: careerData } = await supabase
          .from('careers')
          .select('*')
          .in('id', careerIds);

        // Fetch majors
        const { data: majorData } = await supabase
          .from('majors')
          .select('*')
          .in('id', majorIds);

        return {
          mentors: mentorData || [],
          careers: careerData || [],
          majors: majorData || [],
        };
      } catch (error) {
        console.error('Error in bookmark query:', error);
        return null;
      }
    },
    enabled: !!session?.user?.id,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  if (!bookmarks || (!bookmarks.mentors.length && !bookmarks.careers.length && !bookmarks.majors.length)) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Bookmarks</h2>
        <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
          <BookmarkX className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <p>No bookmarks yet. Your saved items will appear here.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Bookmarks</h2>
      <Tabs defaultValue="mentors" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="majors">Majors</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bookmarks.mentors.map((mentor) => (
              <Card 
                key={mentor.id} 
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedProfile(mentor.id)}
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar 
                    avatarUrl={mentor.avatar_url || ""}
                    imageAlt={mentor.full_name || ""}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{mentor.full_name}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {mentor.career_title || mentor.position || "Mentor"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="careers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bookmarks.careers.map((career) => (
              <Card 
                key={career.id} 
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedCareer(career.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <h3 className="font-semibold text-lg mb-2">{career.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {career.description}
                  </p>
                  {career.salary_range && (
                    <Badge 
                      className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
                    >
                      {career.salary_range}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="majors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bookmarks.majors.map((major) => (
              <Card 
                key={major.id} 
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedMajor(major.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <h3 className="font-semibold text-lg mb-2">{major.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {major.description}
                  </p>
                  {major.potential_salary && (
                    <Badge 
                      className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
                    >
                      {major.potential_salary}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedProfile && (
        <ProfileDetailsDialog
          userId={selectedProfile}
          open={!!selectedProfile}
          onOpenChange={(open) => !open && setSelectedProfile(null)}
        />
      )}

      {selectedCareer && (
        <CareerDetailsDialog
          careerId={selectedCareer}
          open={!!selectedCareer}
          onOpenChange={(open) => !open && setSelectedCareer(null)}
        />
      )}

      {selectedMajor && (
        <MajorDetails
          major={bookmarks.majors.find(m => m.id === selectedMajor)}
          open={!!selectedMajor}
          onOpenChange={(open) => !open && setSelectedMajor(null)}
        />
      )}
    </Card>
  );
}
