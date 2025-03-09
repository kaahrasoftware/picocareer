
import { Plus, BookPlus, Briefcase, GraduationCap, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOptionClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 rounded-full shadow-lg",
            "bg-primary hover:bg-primary/90 transition-all duration-300",
            "h-14 w-14"
          )}
          aria-label="Create new content"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">Create New Content</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-6">
          <Button 
            onClick={() => handleOptionClick("/blog-upload")}
            className="flex flex-col items-center justify-center h-32 p-4 gap-2 hover:bg-primary/10 transition-colors"
            variant="outline"
          >
            <BookPlus className="h-8 w-8 text-primary" />
            <span className="text-base font-medium">Blog Post</span>
          </Button>
          <Button 
            onClick={() => handleOptionClick("/career-upload")}
            className="flex flex-col items-center justify-center h-32 p-4 gap-2 hover:bg-primary/10 transition-colors"
            variant="outline"
          >
            <Briefcase className="h-8 w-8 text-primary" />
            <span className="text-base font-medium">Career</span>
          </Button>
          <Button 
            onClick={() => handleOptionClick("/major-upload")}
            className="flex flex-col items-center justify-center h-32 p-4 gap-2 hover:bg-primary/10 transition-colors"
            variant="outline"
          >
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-base font-medium">Major</span>
          </Button>
          <Button 
            onClick={() => handleOptionClick("/event-upload")}
            className="flex flex-col items-center justify-center h-32 p-4 gap-2 hover:bg-primary/10 transition-colors"
            variant="outline"
          >
            <CalendarPlus className="h-8 w-8 text-primary" />
            <span className="text-base font-medium">Event</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
