import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAuthReturn {
  onAuthClick: () => void;
  onMentorAuthClick: () => void;
  isAuthDialogOpen: boolean;
  setIsAuthDialogOpen: (open: boolean) => void;
}

export function useAuth(): UseAuthReturn {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { toast } = useToast();

  const onAuthClick = () => {
    setIsAuthDialogOpen(true);
  };

  const onMentorAuthClick = () => {
    localStorage.setItem('preferredUserType', 'mentor');
    setIsAuthDialogOpen(true);
  };

  return {
    onAuthClick,
    onMentorAuthClick,
    isAuthDialogOpen,
    setIsAuthDialogOpen,
  };
}