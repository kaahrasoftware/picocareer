
import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { Pagination } from "@/components/ui/pagination";
import type { EmptyStateProps } from "./types";

interface BookmarksListProps<T> {
  bookmarks: T[];
  isLoading: boolean;
  emptyStateProps: EmptyStateProps;
  totalPages: number;
  currentPage: number;
  setPage: (page: number) => void;
  onViewDetails: (item: T) => void;
  renderCard: (item: T, onView: (item: T) => void) => React.ReactNode;
  bookmarkType: string;
}

export function BookmarksList<T>({
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
    return <PageLoader isLoading={true} variant="cards" count={4} />;
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8 bg-card border rounded-lg p-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          {emptyStateProps.icon}
        </div>
        <h3 className="text-lg font-medium mb-2">No Bookmarked {emptyStateProps.type}</h3>
        <p className="text-muted-foreground mb-4">
          You haven't bookmarked any {emptyStateProps.type.toLowerCase()} yet.
        </p>
        <Button asChild>
          <Link to={emptyStateProps.linkPath}>Explore {emptyStateProps.type}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookmarks.map((bookmark, index) => (
          <React.Fragment key={index}>
            {renderCard(bookmark, onViewDetails)}
          </React.Fragment>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
