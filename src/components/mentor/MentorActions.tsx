import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, BookOpen } from "lucide-react";

interface MentorActionsProps {
  onBookSession: () => void;
}

export function MentorActions({ onBookSession }: MentorActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Button className="w-full" variant="default">
        <MessageSquare className="mr-2" />
        Request Chat
      </Button>
      <Button 
        className="w-full" 
        variant="secondary"
        onClick={onBookSession}
      >
        <Calendar className="mr-2" />
        Book Session
      </Button>
      <Button className="w-full" variant="outline">
        <BookOpen className="mr-2" />
        View Profile
      </Button>
    </div>
  );
}