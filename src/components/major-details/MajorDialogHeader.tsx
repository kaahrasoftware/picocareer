
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Bookmark, Share2, BookmarkCheck, Users, DollarSign } from "lucide-react";
import type { Major } from "@/types/database/majors";
import { cn } from "@/lib/utils";

interface MajorDialogHeaderProps {
  major: Major;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onShare: () => void;
}

export function MajorDialogHeader({ 
  major, 
  isBookmarked,
  onBookmarkToggle,
  onShare,
}: MajorDialogHeaderProps) {
  return (
    <DialogHeader className="sticky top-0 z-10 px-4 sm:px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-between items-center">
        <DialogTitle className="text-lg sm:text-xl font-semibold pr-10">
          {major.title}
        </DialogTitle>
        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onBookmarkToggle}
            className={cn(
              "rounded-full transition-colors",
              isBookmarked 
                ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700 hover:border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/60" 
                : "hover:bg-muted"
            )}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          
          {/* Share Button */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onShare}
            className="rounded-full hover:bg-muted"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          {/* Close Button */}
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full hover:bg-muted/80 hover:text-destructive"
            title="Close"
            asChild
          >
            <div data-dialog-close="">
              <X className="h-4 w-4" />
            </div>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {major.field && (
          <Badge 
            variant="outline" 
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/60"
          >
            {major.field}
          </Badge>
        )}
        
        {major.degree_levels && major.degree_levels.length > 0 && (
          <Badge 
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/60"
          >
            {Array.isArray(major.degree_levels) 
              ? major.degree_levels.join(", ") 
              : major.degree_levels}
          </Badge>
        )}
        
        {major.intensity && (
          <Badge 
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/60"
          >
            {major.intensity} Intensity
          </Badge>
        )}

        {major.potential_salary && (
          <Badge 
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/60"
          >
            <DollarSign className="h-3 w-3 mr-1" />
            {major.potential_salary}
          </Badge>
        )}

        {major.profiles_count !== undefined && major.profiles_count > 0 && (
          <Badge 
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/60"
          >
            <Users className="h-3 w-3 mr-1" />
            {major.profiles_count} {major.profiles_count === 1 ? 'User' : 'Users'}
          </Badge>
        )}
      </div>
    </DialogHeader>
  );
}
