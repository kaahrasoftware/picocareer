
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookMarked, User, Briefcase, BookOpen, School } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuthState } from "@/hooks/useAuthState";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { MajorDetails } from "@/components/MajorDetails";
import { MentorBookmarks } from "./MentorBookmarks";
import { CareerBookmarks } from "./CareerBookmarks";
import { MajorBookmarks } from "./MajorBookmarks";
import { ScholarshipBookmarks } from "./ScholarshipBookmarks";
import { MajorProfile, RealtimeBookmarkUpdate } from "./types";

export function BookmarksTabWrapper() {
  const { user } = useAuthState();
  const [activeTab, setActiveTab] = useLocalStorage("bookmarks-active-tab", "mentors");

  // State for profile dialog
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  // State for career dialog
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [showCareerDialog, setShowCareerDialog] = useState(false);
  
  // State for major dialog
  const [selectedMajor, setSelectedMajor] = useState<MajorProfile | null>(null);
  const [showMajorDialog, setShowMajorDialog] = useState(false);

  // Function to handle View Profile button click
  const handleViewProfile = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setShowProfileDialog(true);
  };

  // Function to handle View Career Details button click
  const handleViewCareerDetails = (careerId: string) => {
    setSelectedCareerId(careerId);
    setShowCareerDialog(true);
  };
  
  // Function to handle View Major Details button click
  const handleViewMajorDetails = (major: MajorProfile) => {
    setSelectedMajor(major);
    setShowMajorDialog(true);
  };

  // Set up realtime subscriptions for bookmark changes
  useEffect(() => {
    if (!user) return;
    
    // Listen for changes to bookmarks for the current user
    const channel = supabase
      .channel('bookmark-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for inserts, updates, and deletes
          schema: 'public',
          table: 'user_bookmarks',
          filter: `profile_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Bookmark change detected:', payload);
          
          // Extract the content type and id from the payload
          const contentType = payload.new?.content_type || payload.old?.content_type;
          const contentId = payload.new?.content_id || payload.old?.content_id;
          const isDelete = payload.eventType === 'DELETE';
          
          // Pass the update details to our processing function
          const bookmarkUpdate: RealtimeBookmarkUpdate = {
            contentType: contentType as any,
            contentId,
            action: isDelete ? 'delete' : 'add'
          };
          
          // Update the query cache based on content type
          if (bookmarkUpdate.contentType === 'mentor') {
            queryClient.invalidateQueries({ queryKey: ['bookmarked-mentors'] });
          } else if (bookmarkUpdate.contentType === 'career') {
            queryClient.invalidateQueries({ queryKey: ['bookmarked-careers'] });
          } else if (bookmarkUpdate.contentType === 'major') {
            queryClient.invalidateQueries({ queryKey: ['bookmarked-majors'] });
          } else if (bookmarkUpdate.contentType === 'scholarship') {
            queryClient.invalidateQueries({ queryKey: ['bookmarked-scholarships'] });
          }
        }
      )
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
          <MentorBookmarks 
            activePage={activeTab}
            onViewMentorProfile={handleViewProfile}
          />
        </TabsContent>

        <TabsContent value="careers" className="space-y-4">
          <CareerBookmarks 
            activePage={activeTab}
            onViewCareerDetails={handleViewCareerDetails}
          />
        </TabsContent>

        <TabsContent value="majors" className="space-y-4">
          <MajorBookmarks 
            activePage={activeTab}
            onViewMajorDetails={handleViewMajorDetails}
          />
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-4">
          <ScholarshipBookmarks activePage={activeTab} />
        </TabsContent>
      </Tabs>

      {/* Dialog for Mentor Profile */}
      {selectedMentorId && (
        <ProfileDetailsDialog 
          userId={selectedMentorId} 
          open={showProfileDialog} 
          onOpenChange={setShowProfileDialog} 
        />
      )}

      {/* Dialog for Career Details */}
      {selectedCareerId && (
        <CareerDetailsDialog 
          careerId={selectedCareerId} 
          open={showCareerDialog} 
          onOpenChange={setShowCareerDialog} 
        />
      )}
      
      {/* Dialog for Major Details */}
      {selectedMajor && (
        <MajorDetails
          major={selectedMajor}
          open={showMajorDialog}
          onOpenChange={setShowMajorDialog}
        />
      )}
    </div>
  );
}
