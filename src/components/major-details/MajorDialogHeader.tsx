import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, Share2 } from "lucide-react";
import type { Major } from "@/types/database/majors";
import { Button } from "@/components/ui/button";

interface MajorDialogHeaderProps {
  major: Major;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onShare: () => void;
}

export function MajorDialogHeader({ major, isBookmarked, onBookmarkToggle, onShare }: MajorDialogHeaderProps) {
  const formatProfileCount = (count: number | undefined) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + "K";
    return (count / 1000000).toFixed(1) + "M";
  };

  return (
    <DialogHeader className="p-4 pb-0 md:p-6 md:pb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col gap-2">
          <DialogTitle className="text-xl md:text-2xl font-bold">{major.title}</DialogTitle>
          {major.potential_salary && (
            <Badge variant="outline" className="bg-[#FFDEE2] text-[#4B5563] self-start">
              {major.potential_salary}
            </Badge>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-2">
            <Users className="h-3 w-3 md:h-4 md:w-4" />
            {formatProfileCount(major.profiles_count)} Mentors
          </Badge>
          <div className="w-[100px] md:w-[120px] flex justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onShare}
              className="h-9 w-9"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Heart 
              className={`h-4 w-4 md:h-5 md:w-5 cursor-pointer hover:scale-110 transition-transform ${
                isBookmarked ? 'fill-current text-[#ea384c]' : 'text-gray-400'
              }`}
              onClick={onBookmarkToggle}
            />
          </div>
        </div>
      </div>
    </DialogHeader>
  );
}