import { Button } from "@/components/ui/button";

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
      className="min-w-[200px]" 
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Load More"}
    </Button>
  );
}