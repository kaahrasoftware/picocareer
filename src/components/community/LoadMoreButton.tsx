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
      className="w-full mt-6" 
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Load More"}
    </Button>
  );
}