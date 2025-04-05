
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  hasMore: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export function LoadMoreButton({ hasMore, isLoading, onClick }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <Button 
      variant="outline" 
      className="min-w-[200px] relative" 
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </span>
      ) : (
        "Load More"
      )}
    </Button>
  );
}
