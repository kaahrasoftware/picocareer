
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface SessionTimeoutDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onLogout: () => void;
  timeoutMinutes: number;
}

export function SessionTimeoutDialog({
  isOpen,
  onContinue,
  onLogout,
  timeoutMinutes = 10
}: SessionTimeoutDialogProps) {
  const [timeLeft, setTimeLeft] = useState(timeoutMinutes * 60);
  
  // Format seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset timer when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(timeoutMinutes * 60);
    }
  }, [isOpen, timeoutMinutes]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen, timeLeft, onLogout]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onContinue()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Your session is about to expire
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-center text-muted-foreground mb-4">
            For your security, you'll be logged out automatically in:
          </p>
          <div className="text-3xl font-bold text-center text-primary">
            {formatTime(timeLeft)}
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="sm:flex-1"
          >
            Logout now
          </Button>
          <Button
            onClick={onContinue}
            className="sm:flex-1"
          >
            Continue session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
