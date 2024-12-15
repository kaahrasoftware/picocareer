import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 right-4 z-50"
      disabled
    >
      <Moon className="h-5 w-5" />
      <span className="sr-only">Dark mode enabled</span>
    </Button>
  );
}