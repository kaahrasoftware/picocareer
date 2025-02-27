
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
}

export function ActionButton({ onClick }: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="mt-2 text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
      onClick={onClick}
    >
      View Detail
      <ExternalLink className="w-4 h-4 ml-2" />
    </Button>
  );
}
