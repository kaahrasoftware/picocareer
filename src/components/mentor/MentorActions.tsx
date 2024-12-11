import { User } from "@/integrations/supabase/types/user.types";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare } from "lucide-react";

interface MentorActionsProps {
  mentor: User;
}

export function MentorActions({ mentor }: MentorActionsProps) {
  return (
    <div className="flex gap-4">
      <Button className="flex-1" variant="default">
        <Calendar className="w-4 h-4 mr-2" />
        Book Session
      </Button>
      <Button className="flex-1" variant="outline">
        <MessageSquare className="w-4 h-4 mr-2" />
        Message
      </Button>
    </div>
  );
}