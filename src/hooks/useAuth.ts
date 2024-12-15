import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAuthReturn {
  onAuthClick: (userType?: 'mentor') => void;
  isAuthDialogOpen: boolean;
  setIsAuthDialogOpen: (open: boolean) => void;
}

export function useAuth(): UseAuthReturn {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { toast } = useToast();

  const onAuthClick = (userType?: 'mentor') => {
    if (userType === 'mentor') {
      // Store the user type preference for when they sign up
      localStorage.setItem('preferredUserType', 'mentor');
    }
    setIsAuthDialogOpen(true);
  };

  return {
    onAuthClick,
    isAuthDialogOpen,
    setIsAuthDialogOpen,
  };
}