
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
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
    <Card className={`transition-all duration-200 border ${categoryColor}`}>
      <CardHeader className="relative">
        <CardTitle className="text-base font-semibold">
          {announcement.title}
        </CardTitle>
        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-2">
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
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap line-clamp-3 text-sm font-normal text-gray-600">
          {announcement.content}
        </p>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          {announcement.category && (
            <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
              {announcement.category}
            </span>
          )}
          <time>
            {format(new Date(announcement.created_at), 'MMM d, yyyy')}
          </time>
          {announcement.created_by_profile && (
            <p className="text-cyan-500">
              Posted by: {announcement.created_by_profile.first_name} {announcement.created_by_profile.last_name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
