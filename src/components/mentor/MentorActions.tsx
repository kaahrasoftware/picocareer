import { Button } from "@/components/ui/button";

interface MentorActionsProps {
  id: string;
}

export function MentorActions({ id }: MentorActionsProps) {
  return (
    <div className="flex gap-4">
      <Button className="flex-1" variant="default">
        Book Session
      </Button>
      <Button className="flex-1" variant="secondary">
        Message
      </Button>
    </div>
  );
}