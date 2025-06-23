
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Shield } from "lucide-react";
import { ScholarshipScraperDialog } from "./ScholarshipScraperDialog";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";

interface ScholarshipScraperButtonProps {
  onScrapingComplete?: () => void;
}

export function ScholarshipScraperButton({ onScrapingComplete }: ScholarshipScraperButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { session, profile } = useAuthSession();
  const { toast } = useToast();

  const handleClick = () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the scholarship scraper",
        variant: "destructive",
      });
      return;
    }

    if (profile?.user_type !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can access the scholarship scraper",
        variant: "destructive",
      });
      return;
    }

    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Bot className="h-4 w-4" />
        AI Scholarship Scraper
        <Shield className="h-3 w-3 text-muted-foreground" />
      </Button>

      <ScholarshipScraperDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onScrapingComplete={onScrapingComplete}
      />
    </>
  );
}
