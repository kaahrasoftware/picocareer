
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ModernLoadingSkeleton } from "./ModernLoadingSkeleton";

interface EmptyStateProps {
  icon: ReactNode;
  linkPath: string;
  type: string;
}

interface BookmarksListProps<T> {
  bookmarks: T[];
  isLoading: boolean;
  emptyStateProps: EmptyStateProps;
  totalPages: number;
  currentPage: number;
  setPage: (page: number) => void;
  onViewDetails: (item: T) => void;
  renderCard: (item: T, handleView: (item: T) => void) => ReactNode;
  bookmarkType: string;
}

export function BookmarksList<T extends { id: string }>({
  bookmarks,
  isLoading,
  emptyStateProps,
  totalPages,
  currentPage,
  setPage,
  onViewDetails,
  renderCard,
  bookmarkType
}: BookmarksListProps<T>) {
  if (isLoading) {
    return <ModernLoadingSkeleton />;
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-primary/20">
          {emptyStateProps.icon}
        </div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          No bookmarked {emptyStateProps.type}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          Start exploring {emptyStateProps.type} and bookmark the ones you're interested in. 
          Build your personalized collection of opportunities.
        </p>
        <Button 
          asChild 
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Link to={emptyStateProps.linkPath}>
            Explore {emptyStateProps.type}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => renderCard(bookmark, onViewDetails))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-primary/20 hover:bg-primary/10 hover:border-primary/30 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2 rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-card-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="border-primary/20 hover:bg-primary/10 hover:border-primary/30 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
