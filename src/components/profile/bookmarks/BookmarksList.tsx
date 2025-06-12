
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

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
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyStateProps.icon}
        <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarked {emptyStateProps.type}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start exploring {emptyStateProps.type} and bookmark the ones you're interested in.
        </p>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to={emptyStateProps.linkPath}>
              Explore {emptyStateProps.type}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => renderCard(bookmark, onViewDetails))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
