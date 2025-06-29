
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationHeader } from './notification-details/NotificationHeader';
import { NotificationContent } from './notification-details/NotificationContent';
import { NotificationActions } from './notification-details/NotificationActions';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import type { Notification } from './NotificationPanel';

interface NotificationDetailsDialogProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleRead: (notification: Notification) => void;
  onDelete: (notificationId: string) => void;
}

export function NotificationDetailsDialog({
  notification,
  open,
  onOpenChange,
  onToggleRead,
  onDelete
}: NotificationDetailsDialogProps) {
  if (!notification) return null;

  const handleToggleRead = () => {
    onToggleRead(notification);
  };

  const handleDelete = () => {
    onDelete(notification.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Notification Details
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-gray-50/50">
            <NotificationHeader
              title={notification.title}
              createdAt={notification.created_at}
              read={notification.read}
              type={notification.type}
              onToggleRead={handleToggleRead}
            />
          </div>
          
          <div className="p-4">
            <NotificationContent
              message={notification.message}
              isExpanded={true}
              type={notification.type}
              action_url={notification.action_url}
              notification_id={notification.id}
            />
          </div>
          
          <div className="border-t pt-4">
            <NotificationActions
              isExpanded={true}
              onToggleExpand={() => {}} // No-op since we're always expanded in dialog
              onToggleRead={handleToggleRead}
              read={notification.read}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
