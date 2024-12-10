import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface BookSessionDialogProps {
  mentor: {
    name: string;
    imageUrl: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SESSION_TYPES = [
  { id: "intro", label: "Introduction Call" },
  { id: "quick-advice", label: "Quick Advice" },
  { id: "walkthrough", label: "Walk-through Session" },
];

export function BookSessionDialog({ mentor, open, onOpenChange }: BookSessionDialogProps) {
  const [date, setDate] = useState<Date>();
  const [sessionType, setSessionType] = useState<string>();
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    // Here you would typically send the booking data to your backend
    console.log({
      mentorName: mentor.name,
      date,
      sessionType,
      note,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-kahra-dark text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Book a Session with {mentor.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Select Date & Time</h4>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="bg-kahra-darker rounded-lg p-4"
              disabled={(date) => date < new Date()}
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">Session Type</h4>
            <Select onValueChange={setSessionType}>
              <SelectTrigger className="w-full bg-kahra-darker border-none">
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent className="bg-kahra-darker border-none">
                {SESSION_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Note for the Meeting</h4>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Share what you'd like to discuss..."
              className="bg-kahra-darker border-none resize-none h-32"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!date || !sessionType}>
              Book Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}