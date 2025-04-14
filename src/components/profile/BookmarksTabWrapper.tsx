
import { useAuthState } from "@/hooks/useAuthState";
import { BookmarksTab } from "./BookmarksTab";
import { useBookmarksRealtime } from "@/hooks/useBookmarksRealtime";

export function BookmarksTabWrapper() {
  const { user } = useAuthState();
  
  // Set up real-time updates for bookmarks
  useBookmarksRealtime(user?.id);
  
  return <BookmarksTab />;
}
