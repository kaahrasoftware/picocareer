import type { Profile } from "@/types/database/profiles";

interface BookmarksTabProps {
  profile: Profile;
}

export function BookmarksTab({ profile }: BookmarksTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Your Bookmarks</h2>
      {/* Render bookmarks related to the profile */}
      <ul>
        {/* Example bookmarks rendering */}
        {profile.bookmarks?.map((bookmark) => (
          <li key={bookmark.id} className="py-2">
            <a href={bookmark.url} className="text-blue-600 hover:underline">
              {bookmark.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
