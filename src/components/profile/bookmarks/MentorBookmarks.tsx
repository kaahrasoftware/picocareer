
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Bookmark, ExternalLink, UserSquare2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookmarkSkeleton } from "./BookmarkSkeleton";
import { EmptyBookmarks } from "./EmptyBookmarks";

interface MentorProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  user_type?: string;
  position?: string;
  bio?: string;
  company_id?: string;
  location?: string;
  skills?: string[];
  top_mentor?: boolean;
  company_name?: any;
  career_title?: any;
}

interface MentorBookmarksProps {
  bookmarks: any[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function MentorBookmarks({ bookmarks, onDelete, isLoading }: MentorBookmarksProps) {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  const loadMentorData = async () => {
    if (bookmarks.length === 0) return;
    
    setLoadingMentors(true);
    try {
      // Extract all mentor IDs from bookmarks
      const mentorIds = bookmarks
        .filter(bookmark => bookmark?.content_id)
        .map(bookmark => bookmark.content_id);
      
      if (mentorIds.length === 0) {
        setMentors([]);
        return;
      }

      // Fetch mentor data
      const { data, error } = await supabase
        .from('profiles')
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
          top_mentor,
          companies:company_id(name)
        `)
        .in('id', mentorIds)
        .eq('user_type', 'mentor');

      if (error) {
        console.error("Error loading mentor data:", error);
        toast.error("Failed to load mentor data");
        return;
      }

      // Transform data to include company name
      const transformedData = data.map((mentor: any) => ({
        ...mentor,
        company_name: mentor.companies?.name || "Unknown Company",
      }));

      setMentors(transformedData);
    } catch (error) {
      console.error("Error in loadMentorData:", error);
      toast.error("Something went wrong while loading mentor data");
    } finally {
      setLoadingMentors(false);
    }
  };

  // Load mentor data when bookmarks change
  if (bookmarks.length > 0 && mentors.length === 0 && !loadingMentors) {
    loadMentorData();
  }

  const handleBookmarkDelete = async (bookmarkId: string) => {
    if (window.confirm("Remove this bookmark?")) {
      await onDelete(bookmarkId);
    }
  };

  const handleViewMentor = (mentor: MentorProfile) => {
    // View mentor details logic
    toast.info(`Viewing mentor: ${mentor.full_name}`);
  };

  const renderMentorCard = (mentor: MentorProfile, handleView: (mentor: MentorProfile) => void) => {
    return (
      <Card key={mentor.id} className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              {mentor.avatar_url ? (
                <AvatarImage src={mentor.avatar_url} alt={mentor.full_name} />
              ) : (
                <AvatarFallback>
                  {mentor.full_name?.charAt(0) || "M"}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-medium">{mentor.full_name}</h3>
              <div className="text-sm text-muted-foreground">
                {mentor.position} {mentor.company_name ? `at ${mentor.company_name}` : ''}
              </div>
              
              {mentor.skills && mentor.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {mentor.skills.slice(0, 3).map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {mentor.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleView(mentor)}
                className="flex items-center"
              >
                <UserSquare2 className="w-4 h-4 mr-1" />
                View
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Book
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading || loadingMentors) {
    return (
      <div className="space-y-4">
        <BookmarkSkeleton />
        <BookmarkSkeleton />
        <BookmarkSkeleton />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return <EmptyBookmarks type="mentors" />;
  }

  if (mentors.length === 0) {
    return <EmptyBookmarks type="mentors" message="No mentors found from your bookmarks." />;
  }

  return (
    <div className="space-y-4">
      {mentors.map((mentor) => {
        // Find the bookmark object for this mentor
        const bookmark = bookmarks.find(bm => bm.content_id === mentor.id);
        
        return (
          <div key={mentor.id} className="relative group">
            {bookmark && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={() => handleBookmarkDelete(bookmark.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {renderMentorCard(mentor, handleViewMentor)}
          </div>
        );
      })}
    </div>
  );
}
