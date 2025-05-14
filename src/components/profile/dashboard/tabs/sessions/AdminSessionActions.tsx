
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import {
  MoreHorizontal,
  Trash2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  CalendarX,
} from "lucide-react";
import { DeleteSessionDialog } from "./dialogs/DeleteSessionDialog";
import { UpdateStatusDialog } from "./dialogs/UpdateStatusDialog";
import { RequestFeedbackDialog } from "./dialogs/RequestFeedbackDialog";
import { MentorSession } from "@/types/database/session";

interface AdminSessionActionsProps {
  session: MentorSession;
  onRefresh: () => void;
  onViewFeedback: (sessionId: string) => void;
}

export function AdminSessionActions({
  session,
  onRefresh,
  onViewFeedback,
}: AdminSessionActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>("completed");

  const { toast } = useToast();
  const { session: authSession } = useAuthSession();

  const handleStatusUpdate = async (status: string) => {
    setTargetStatus(status);
    setIsStatusDialogOpen(true);
  };

  const handleMarkCompleted = () => {
    handleStatusUpdate("completed");
  };

  const handleMarkNoShow = () => {
    handleStatusUpdate("no_show");
  };

  const handleMarkCancelled = () => {
    handleStatusUpdate("cancelled");
  };

  const handleRequestFeedback = () => {
    setIsFeedbackDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewFeedback(session.id)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            View Feedback
          </DropdownMenuItem>

          {session.status === "scheduled" && (
            <>
              <DropdownMenuItem onClick={handleMarkCompleted}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMarkNoShow}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Mark as No-Show
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMarkCancelled}>
                <CalendarX className="mr-2 h-4 w-4" />
                Mark as Cancelled
              </DropdownMenuItem>
            </>
          )}

          {session.status === "completed" && (
            <DropdownMenuItem onClick={handleRequestFeedback}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Request Feedback
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Session
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteSessionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        sessionId={session.id}
        sessionDetails={
          `${session.mentor?.full_name || "Mentor"} with ${
            session.mentee?.full_name || "Mentee"
          }` +
          ` on ${new Date(session.scheduled_at).toLocaleDateString()}`
        }
        onSuccess={() => {
          onRefresh();
          toast({
            title: "Session deleted",
            description: "The session has been permanently deleted.",
          });
        }}
      />

      <UpdateStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        sessionId={session.id}
        sessionDetails={
          `${session.mentor?.full_name || "Mentor"} with ${
            session.mentee?.full_name || "Mentee"
          }` +
          ` on ${new Date(session.scheduled_at).toLocaleDateString()}`
        }
        targetStatus={targetStatus}
        onSuccess={() => {
          onRefresh();
          const statusMap: Record<string, string> = {
            completed: "completed",
            cancelled: "cancelled",
            no_show: "marked as no-show",
            scheduled: "scheduled",
          };
          toast({
            title: "Status updated",
            description: `The session has been ${statusMap[targetStatus] || targetStatus}.`,
          });
        }}
      />

      <RequestFeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onClose={() => setIsFeedbackDialogOpen(false)}
        sessionId={session.id}
        mentorName={session.mentor?.full_name || "Mentor"}
        menteeName={session.mentee?.full_name || "Mentee"}
        onSuccess={() => {
          onRefresh();
          toast({
            title: "Feedback requested",
            description: "Feedback requests have been sent to both participants.",
          });
        }}
      />
    </>
  );
}
