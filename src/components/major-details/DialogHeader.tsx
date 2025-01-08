import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DialogHeaderProps {
  title: string;
  potentialSalary?: string | null;
  profilesCount?: number;
  majorId: string;
}

export function DialogHeader({ title, potentialSalary, profilesCount, majorId }: DialogHeaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();

  const formatProfileCount = (count: number | undefined) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + "K";
    return (count / 1000000).toFixed(1) + "M";
  };

  const handleBookmarkToggle = async () => {
    if (!session?.user.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark majors",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isBookmarked) {
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('profile_id', session.user.id)
          .eq('content_type', 'major')
          .eq('content_id', majorId);
      } else {
        await supabase
          .from('user_bookmarks')
          .insert({
            profile_id: session.user.id,
            content_type: 'major',
            content_id: majorId,
          });
      }
      
      setIsBookmarked(!isBookmarked);
      toast({
        title: isBookmarked ? "Major unbookmarked" : "Major bookmarked",
        description: isBookmarked ? "Major removed from your bookmarks" : "Major added to your bookmarks",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogHeader className="p-4 pb-0 md:p-6 md:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <DialogTitle className="text-lg md:text-2xl font-bold">
            {title}
          </DialogTitle>
          {potentialSalary && (
            <Badge variant="outline" className="bg-[#FFDEE2] text-[#4B5563] self-start text-xs md:text-sm">
              {potentialSalary}
            </Badge>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-1 text-xs md:text-sm">
            <Users className="h-3 w-3 md:h-4 md:w-4" />
            {formatProfileCount(profilesCount)} Mentors
          </Badge>
          <div className="w-[100px] md:w-[120px] flex justify-center">
            <Heart 
              className={`h-4 w-4 md:h-5 md:w-5 cursor-pointer hover:scale-110 transition-transform ${
                isBookmarked ? 'fill-current text-[#ea384c]' : 'text-gray-400'
              }`}
              onClick={handleBookmarkToggle}
            />
          </div>
        </div>
      </div>
    </DialogHeader>
  );
}