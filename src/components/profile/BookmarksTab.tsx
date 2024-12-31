import React from "react";
import { Card } from "@/components/ui/card";

export function BookmarksTab() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Bookmarks</h2>
      <div className="text-muted-foreground">
        No bookmarks yet. Your saved items will appear here.
      </div>
    </Card>
  );
}