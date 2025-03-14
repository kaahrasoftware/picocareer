
import { Plus, BookPlus, FileBox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { FeedUploadDialog } from "@/components/forms/feed/FeedUploadDialog";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleOptionClick = (action: string) => {
    setIsOpen(false);
    
    if (action === "blog") {
      navigate("/blog/upload");
    } else if (action === "resource") {
      setFeedDialogOpen(true);
    }
  };

  return (
    <>
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
              onClick={() => handleOptionClick("blog")}
              className="flex flex-col items-center justify-center h-36 w-full p-4 gap-3 hover:bg-primary/10 transition-colors"
              variant="outline"
            >
              <BookPlus className="h-12 w-12 text-primary" />
              <span className="text-lg font-medium">Blog Post</span>
            </Button>
            
            <Button 
              onClick={() => handleOptionClick("resource")}
              className="flex flex-col items-center justify-center h-36 w-full p-4 gap-3 hover:bg-primary/10 transition-colors"
              variant="outline"
            >
              <FileBox className="h-12 w-12 text-primary" />
              <span className="text-lg font-medium">Resource</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource Upload Dialog */}
      <FeedUploadDialog 
        open={feedDialogOpen}
        onOpenChange={setFeedDialogOpen}
      />
    </>
  );
}
