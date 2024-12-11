import { useEffect, useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreateStoryDialog } from "../stories/CreateStoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { Story } from "@/integrations/supabase/types/story.types";
import { User } from "@/integrations/supabase/types/user.types";
import { useToast } from "@/hooks/use-toast";

export const StoriesSection = () => {
  const [stories, setStories] = useState<(Story & { user: User })[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchStories = async () => {
    try {
      const { data: storiesData, error } = await supabase
        .from("stories")
        .select(`
          *,
          user:users!stories_mentor_id_fkey(*)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse the stats JSON for each user
      const processedStories = storiesData.map(story => ({
        ...story,
        user: {
          ...story.user,
          stats: typeof story.user.stats === 'string' 
            ? JSON.parse(story.user.stats)
            : story.user.stats
        }
      }));
      
      setStories(processedStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load stories. Please try again later.",
      });
    }
  };

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setCurrentUser({
          ...data,
          stats: typeof data.stats === 'string' 
            ? JSON.parse(data.stats)
            : data.stats
        });
      }
    }
  };

  useEffect(() => {
    fetchStories();
    fetchCurrentUser();
  }, []);

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Stories</h2>
        {currentUser?.user_type === "mentor" && (
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Story
          </Button>
        )}
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center space-y-2 min-w-[100px]">
            <div className="relative cursor-pointer group">
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-kahra-secondary to-kahra-primary">
                <Avatar className="w-14 h-14 border-2 border-background">
                  <AvatarImage src={story.user.image_url} alt={story.user.name} />
                  <AvatarFallback>{story.user.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -right-1 -bottom-1 z-10 bg-kahra-primary rounded-full p-1">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">@{story.user.username}</span>
          </div>
        ))}
      </div>

      <CreateStoryDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchStories}
      />
    </section>
  );
};