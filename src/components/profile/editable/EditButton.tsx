import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface EditButtonProps {
  onClick: () => void;
}

export function EditButton({ onClick }: EditButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={onClick}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );
}