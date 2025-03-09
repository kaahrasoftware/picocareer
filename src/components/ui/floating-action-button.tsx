
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({
  icon,
  onClick,
  className,
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-30 rounded-full w-14 h-14 shadow-lg",
        "bg-picocareer-primary hover:bg-picocareer-accent transition-all",
        "flex items-center justify-center",
        "hover:shadow-xl hover:scale-105 active:scale-95",
        "animate-bounce-once",
        className
      )}
    >
      {icon}
    </Button>
  );
}
