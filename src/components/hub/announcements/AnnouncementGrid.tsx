
import { HubAnnouncement } from "@/types/database/hubs";
import { AnnouncementCard } from "./AnnouncementCard";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { useState } from "react";

interface AnnouncementGridProps {
  announcements: HubAnnouncement[];
  getCardColor: (category: string) => string;
  onEdit: (announcement: HubAnnouncement) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export function AnnouncementGrid({
  announcements,
  getCardColor,
  onEdit,
  onDelete,
  isAdmin
}: AnnouncementGridProps) {
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(announcements.length / itemsPerPage);

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No announcements found
      </div>
    );
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnnouncements = announcements.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentAnnouncements.map(announcement => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            categoryColor={getCardColor(announcement.category)}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
