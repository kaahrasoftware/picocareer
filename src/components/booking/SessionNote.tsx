import { Textarea } from "@/components/ui/textarea";

interface SessionNoteProps {
  note: string;
  onNoteChange: (note: string) => void;
}

export function SessionNote({ note, onNoteChange }: SessionNoteProps) {
  return (
    <div>
      <h4 className="font-semibold mb-2">Note for the Meeting</h4>
      <Textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Share what you'd like to discuss..."
        className="bg-picocareer-darker border-none resize-none h-32"
      />
    </div>
  );
}