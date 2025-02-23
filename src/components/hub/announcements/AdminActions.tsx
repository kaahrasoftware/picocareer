
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { HubAnnouncement } from "@/types/database/hubs";
import { Pencil, Trash2 } from "lucide-react";

interface AdminActionsProps {
  announcement: HubAnnouncement;
  onEdit: (announcement: HubAnnouncement) => void;
  onDelete: (id: string) => void;
  variant?: "default" | "overlay";
}

export function AdminActions({ 
  announcement, 
  onEdit, 
  onDelete,
  variant = "default"
}: AdminActionsProps) {
  const isOverlay = variant === "overlay";
  
  return (
    <div 
      className={`flex gap-2 ${isOverlay ? "z-10" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(announcement)}
        className={isOverlay ? "bg-white/80 hover:bg-white" : ""}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className={isOverlay ? "bg-white/80 hover:bg-white" : ""}
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
  );
}
