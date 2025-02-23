
import { format } from "date-fns";
import { Bell, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HubAnnouncement } from "@/types/database/hubs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

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
        {announcement.image_url && (
          <div className="w-full h-48 relative">
            <img 
              src={announcement.image_url} 
              alt="Announcement cover" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className={`absolute top-4 left-4 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor}`}>
              {announcement.category}
            </span>
            {isAdmin && (
              <div 
                className="absolute top-4 right-4 flex gap-2 z-10" 
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(announcement)}
                  className="bg-white/80 hover:bg-white"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the announcement.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(announcement.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
        <div className={announcement.image_url ? "p-4" : ""}>
          <CardHeader className={`relative pb-3 ${announcement.image_url ? "p-0" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <CardTitle className="text-base font-semibold">
                  {announcement.title}
                </CardTitle>
              </div>
              {isAdmin && !announcement.image_url && (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(announcement)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the announcement.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(announcement.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
            {!announcement.image_url && announcement.category && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor} mt-2`}>
                {announcement.category}
              </span>
            )}
          </CardHeader>
          <CardContent className={`${announcement.image_url ? "p-0" : "pt-0"}`}>
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

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Bell className="h-5 w-5 text-gray-500" />
              {announcement.title}
            </DialogTitle>
            {!announcement.image_url && announcement.category && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor} mt-2`}>
                {announcement.category}
              </span>
            )}
          </DialogHeader>
          
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
        </DialogContent>
      </Dialog>
    </>
  );
}
