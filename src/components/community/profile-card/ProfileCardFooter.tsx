
import { Button } from "@/components/ui/button";

interface ProfileCardFooterProps {
  onViewProfile: () => void;
}

export function ProfileCardFooter({ onViewProfile }: ProfileCardFooterProps) {
  return (
    <div className="mt-auto w-full">
      <Button 
        variant="outline" 
        className="w-full bg-background hover:bg-muted/50 transition-colors"
        onClick={onViewProfile}
      >
        View Profile
      </Button>
    </div>
  );
}
