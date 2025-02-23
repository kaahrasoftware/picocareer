
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HubAnnouncement } from "@/types/database/hubs";
import { Bell } from "lucide-react";
import { format } from "date-fns";

interface AnnouncementDialogProps {
  announcement: HubAnnouncement;
  categoryColor: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnnouncementDialog({
  announcement,
  categoryColor,
  open,
  onOpenChange
}: AnnouncementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <ScrollArea className="h-[90vh]">
          <div className="p-6">
            {announcement.image_url && (
              <div className="relative -mt-6 -mx-6 mb-6">
                <img 
                  src={announcement.image_url} 
                  alt="Announcement cover" 
                  className="w-full h-[300px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className={`absolute bottom-4 left-4 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor}`}>
                  {announcement.category}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xl font-semibold">
              <Bell className="h-5 w-5 text-gray-500" />
              {announcement.title}
            </div>

            {!announcement.image_url && announcement.category && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor} mt-2`}>
                {announcement.category}
              </span>
            )}
            
            <div className="mt-4">
              <div 
                className="prose max-w-none text-base text-gray-600"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />

              <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Posted on:</span>
                  <time>
                    {format(new Date(announcement.created_at), 'MMMM d, yyyy')}
                  </time>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
