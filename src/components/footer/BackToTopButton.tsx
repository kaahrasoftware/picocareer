
import { ChevronUp, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackToTopButtonProps {
  isMobile?: boolean;
}

export function BackToTopButton({ isMobile = false }: BackToTopButtonProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isMobile) {
    return (
      <div className="flex justify-center mt-8 md:hidden">
        <Button
          onClick={scrollToTop}
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted/50 transition-all duration-300"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={scrollToTop} 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1 group"
    >
      <span>Back to Top</span>
      <ChevronUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
    </Button>
  );
}
