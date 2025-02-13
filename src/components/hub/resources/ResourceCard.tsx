import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { HubResource } from "@/types/database/hubs";
import { getResourceIcon } from "./ResourceIcon";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
interface ResourceCardProps {
  resource: HubResource;
  onClick: () => void;
  isAdmin?: boolean;
  onDeleted?: () => void;
}
export function ResourceCard({
  resource,
  onClick,
  isAdmin,
  onDeleted
}: ResourceCardProps) {
  const {
    toast
  } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const {
        error
      } = await supabase.from('hub_resources').delete().eq('id', resource.id);
      if (error) {
        console.error('Delete error:', error);
        toast({
          title: "Error",
          description: "Failed to delete resource. You may not have permission.",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      });
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the resource.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  return <Card className="transition-colors hover:bg-accent cursor-pointer group">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10" onClick={onClick}>
          {getResourceIcon(resource)}
        </div>
        <div className="flex-1" onClick={onClick}>
          <CardTitle className="text-lg">{resource.title}</CardTitle>
          <p className="line-clamp-2 text-gray-600 text-xs font-normal">
            {resource.description}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {resource.category && <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs mb-2">
              {resource.category}
            </span>}
          <div className="flex flex-col items-end gap-1">
            <time className="rounded bg-cyan-400 hover:bg-cyan-300 px-[7px]">
              {format(new Date(resource.created_at), 'MMM d, yyyy')}
            </time>
          </div>
        </div>
        {isAdmin && <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the resource.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>}
      </CardHeader>
    </Card>;
}