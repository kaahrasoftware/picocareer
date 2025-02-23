
import { format } from "date-fns";
import { Bell, Pencil, Trash2 } from "lucide-react";
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
  return (
    <Card className="bg-[#f3f3f3] hover:bg-[#eee] transition-all duration-200 border-gray-200">
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-base font-semibold">
              {announcement.title}
            </CardTitle>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
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
        {announcement.category && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor} mt-2`}>
            {announcement.category}
          </span>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="whitespace-pre-wrap line-clamp-3 text-sm font-normal text-gray-600">
          {announcement.content}
        </p>
        <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
          <time className="text-xs">
            {format(new Date(announcement.created_at), 'MMM d, yyyy')}
          </time>
        </div>
      </CardContent>
    </Card>
  );
}
