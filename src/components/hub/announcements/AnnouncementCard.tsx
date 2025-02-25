
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HubAnnouncement } from "@/types/database/hubs";
import { useState } from "react";
import { AdminActions } from "./AdminActions";
import { AnnouncementDialog } from "./AnnouncementDialog";

interface AnnouncementCardProps {
  announcement: HubAnnouncement;
  categoryColor: string;
  onEdit: (announcement: HubAnnouncement) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export function AnnouncementCard({ 
  announcement, 
  categoryColor, 
  onEdit, 
  onDelete,
  isAdmin 
}: AnnouncementCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card 
        className="bg-[#f3f3f3] hover:bg-[#eee] transition-all duration-200 border-gray-200 cursor-pointer overflow-hidden"
        onClick={() => setShowDetails(true)}
      >
        {announcement.cover_image_url && (
          <div className="w-full h-48 relative">
            <img 
              src={announcement.cover_image_url} 
              alt="Announcement cover" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className={`absolute top-4 left-4 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor}`}>
              {announcement.category}
            </span>
            {isAdmin && (
              <div className="absolute top-4 right-4">
                <AdminActions
                  announcement={announcement}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  variant="overlay"
                />
              </div>
            )}
          </div>
        )}
        <div className={announcement.cover_image_url ? "p-4" : ""}>
          <CardHeader className={`relative pb-3 ${announcement.cover_image_url ? "p-0" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <CardTitle className="text-base font-semibold">
                  {announcement.title}
                </CardTitle>
              </div>
              {isAdmin && !announcement.cover_image_url && (
                <AdminActions
                  announcement={announcement}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
            </div>
            {!announcement.cover_image_url && announcement.category && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor} mt-2`}>
                {announcement.category}
              </span>
            )}
          </CardHeader>
          <CardContent className={`${announcement.cover_image_url ? "p-0" : "pt-0"}`}>
            <div 
              className="prose max-w-none text-sm font-normal text-gray-600 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
            <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
              <time className="text-xs">
                {format(new Date(announcement.created_at), 'MMM d, yyyy')}
              </time>
            </div>
          </CardContent>
        </div>
      </Card>

      <AnnouncementDialog
        announcement={announcement}
        categoryColor={categoryColor}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
}
