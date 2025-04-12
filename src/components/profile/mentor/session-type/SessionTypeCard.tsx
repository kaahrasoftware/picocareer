
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeCardProps {
  sessionType: SessionType;
  onDelete: (id: string) => void;
}

export function SessionTypeCard({ sessionType, onDelete }: SessionTypeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Display custom type name if available, otherwise use the regular type
  const displayTitle = sessionType.type === "Custom" && sessionType.custom_type_name 
    ? sessionType.custom_type_name 
    : sessionType.type;

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle className="text-base font-medium line-clamp-2">
              {displayTitle}
              {sessionType.type === "Custom" && (
                <Badge variant="outline" className="ml-2 text-xs font-normal">
                  Custom
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>{sessionType.duration} minutes</span>
          </div>
          {sessionType.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {sessionType.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {sessionType.meeting_platform?.map((platform) => (
              <Badge key={platform} variant="secondary" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{displayTitle}" session type? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(sessionType.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
