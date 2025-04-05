
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface LoadMoreButtonProps {
  hasMore: boolean;
  isLoading: boolean;
  onClick: () => void;
  className?: string;
  loadingText?: string;
}

export function LoadMoreButton({ 
  hasMore, 
  isLoading, 
  onClick, 
  className = "",
  loadingText = "Loading more..."
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <Button 
      variant="outline" 
      className={`min-w-[200px] ${className}`}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        "Load More"
      )}
    </Button>
  );
}
