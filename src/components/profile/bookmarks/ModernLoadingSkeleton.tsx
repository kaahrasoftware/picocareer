import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ModernLoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border border-border/50">
          {/* Bookmark indicator skeleton */}
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-primary/5 rounded-full p-1.5 border border-primary/10 animate-pulse">
              <div className="h-3.5 w-3.5 bg-primary/20 rounded" />
            </div>
          </div>

          <CardContent className="p-5 space-y-4">
            {/* Header skeleton */}
            <div className="space-y-2">
              <div className="h-5 bg-gradient-to-r from-muted/50 to-muted/30 rounded animate-pulse" />
              <div className="h-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded w-3/4 animate-pulse" />
              
              <div className="flex items-center gap-1.5 pt-1">
                <div className="h-4 w-4 bg-primary/20 rounded animate-pulse" />
                <div className="h-3 bg-muted/40 rounded w-1/2 animate-pulse" />
              </div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-3 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 bg-muted/25 rounded w-5/6 animate-pulse" />
              <div className="h-3 bg-muted/20 rounded w-4/6 animate-pulse" />
            </div>

            {/* Details skeleton */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 bg-primary/20 rounded animate-pulse" />
                <div className="h-3 bg-muted/30 rounded w-2/3 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 bg-primary/20 rounded animate-pulse" />
                <div className="h-3 bg-muted/30 rounded w-1/2 animate-pulse" />
              </div>
            </div>

            {/* Footer skeleton */}
            <div className="flex items-center justify-between pt-2 border-t border-border/20">
              <div className="h-6 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full w-20 animate-pulse" />
              <div className="h-8 bg-muted/30 rounded w-24 animate-pulse" />
            </div>
          </CardContent>
          
          {/* Bottom accent skeleton */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary/20 to-secondary/30 animate-pulse" />
        </Card>
      ))}
    </div>
  );
}