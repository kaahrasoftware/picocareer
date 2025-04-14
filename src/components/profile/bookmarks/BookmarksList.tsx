
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StandardPagination } from "@/components/common/StandardPagination";
import { EmptyState } from "@/components/scholarships/EmptyState";
import { BookmarkedEntity, BookmarkType } from "./types";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

interface BookmarksListProps<T extends BookmarkedEntity> {
  bookmarks: T[];
  isLoading: boolean;
  emptyStateProps: {
    icon: React.ReactNode;
    linkPath: string;
    type: string;
  };
  totalPages: number;
  currentPage: number;
  setPage: (page: number) => void;
  onViewDetails: (item: T) => void;
  renderCard: (item: T, handleView: (item: T) => void) => React.ReactNode;
  bookmarkType: BookmarkType;
}

export function BookmarksList<T extends BookmarkedEntity>({
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
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Card className="text-center p-8 border-dashed bg-muted/30">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-primary/10 p-3 rounded-full">
            {emptyStateProps.icon}
          </div>
          <h3 className="font-semibold text-xl mt-2">No bookmarked {emptyStateProps.type}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            You haven't bookmarked any {emptyStateProps.type} yet. When you find {emptyStateProps.type} you 
            like, click the bookmark icon to save them here.
          </p>
          <Button asChild>
            <Link to={emptyStateProps.linkPath}>Browse {emptyStateProps.type}</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookmarks.map((item) => renderCard(item, onViewDetails))}
      </div>
      
      <StandardPagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />
    </>
  );
}
