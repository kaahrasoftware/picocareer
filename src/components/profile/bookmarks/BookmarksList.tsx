
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";

export interface BookmarkedEntity {
  id: string;
  [key: string]: any;
}

export interface BookmarksListProps<T extends BookmarkedEntity> {
  items: T[];
  isLoading: boolean;
  emptyMessage: string;
  renderItem: (item: T, handleView: (item: T) => void) => React.ReactNode;
}

export function BookmarksList<T extends BookmarkedEntity>({ 
  items, 
  isLoading, 
  emptyMessage, 
  renderItem 
}: BookmarksListProps<T>) {
  const handleView = (item: T) => {
    console.log('Viewing item:', item);
    // Add navigation logic here if needed
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => renderItem(item, handleView))}
    </div>
  );
}
