
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, LogIn } from "lucide-react";

interface AuthPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  redirectUrl?: string;
}

export function AuthPromptDialog({
  isOpen,
  onClose,
  title = "Authentication Required",
  description = "You need to sign in or create an account to apply for scholarships.",
  redirectUrl,
}: AuthPromptDialogProps) {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  const handleLogin = () => {
    setIsClosing(true);
    onClose();
    // Add redirect URL as state to return after login
    navigate("/auth?tab=signin", { state: { redirectUrl } });
  };

  const handleRegister = () => {
    setIsClosing(true);
    onClose();
    navigate("/auth?tab=signup", { state: { redirectUrl } });
  };

  return (
    <AlertDialog open={isOpen && !isClosing} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            onClick={handleLogin}
          >
            <LogIn className="h-4 w-4 mr-2" /> Sign In
          </Button>
          <AlertDialogAction 
            className="w-full sm:w-auto" 
            onClick={handleRegister}
          >
            <UserPlus className="h-4 w-4 mr-2" /> Create Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
