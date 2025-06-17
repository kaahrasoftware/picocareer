
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock, User, MessageSquare } from "lucide-react";

interface SessionParticipant {
  id: string;
  full_name: string;
  email: string;
}

interface SessionType {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface MentorSession {
  id: string;
  status: string;
  scheduled_at: string;
  notes: string;
  meeting_link: string;
  meeting_platform: string;
  mentor: SessionParticipant;
  mentee: SessionParticipant;
  session_type: SessionType;
}

interface AdminSessionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  session: MentorSession;
}

export function AdminSessionDetailsDialog({
  open,
  onClose,
  session
}: AdminSessionDetailsDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Session Details
            <Badge className={getStatusColor(session.status)}>
              {session.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Date: {format(new Date(session.scheduled_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Time: {format(new Date(session.scheduled_at), 'h:mm a')}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Type:</span> {session.session_type.name}
              </div>
              <div className="text-sm">
                <span className="font-medium">Duration:</span> {session.session_type.duration} minutes
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <h3 className="font-semibold">Participants</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Mentor</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{session.mentor.full_name}</p>
                  <p className="text-xs text-muted-foreground">{session.mentor.email}</p>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Mentee</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{session.mentee.full_name}</p>
                  <p className="text-xs text-muted-foreground">{session.mentee.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Meeting Information</h3>
            <div className="p-3 border rounded-lg">
              <div className="text-sm">
                <span className="font-medium">Platform:</span> {session.meeting_platform}
              </div>
              {session.meeting_link && (
                <div className="text-sm mt-1">
                  <span className="font-medium">Link:</span>{' '}
                  <a 
                    href={session.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {session.meeting_link}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <h3 className="font-semibold">Notes</h3>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {session.notes}
                </p>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="p-3 border rounded-lg bg-muted/50">
            <div className="text-sm">
              <span className="font-medium">Session Price:</span> ${session.session_type.price}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
