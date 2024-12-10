import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

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

// Mock available time slots - in a real app, these would come from an API
const AVAILABLE_TIME_SLOTS = [
  "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
];

export function BookSessionDialog({ mentor, open, onOpenChange }: BookSessionDialogProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [sessionType, setSessionType] = useState<string>();
  const [note, setNote] = useState("");
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const mentorTimezone = "America/Los_Angeles"; // This would come from mentor's data in a real app

  const handleSubmit = () => {
    // Here you would typically send the booking data to your backend
    console.log({
      mentorName: mentor.name,
      date,
      time: selectedTime,
      sessionType,
      note,
      userTimezone,
      mentorTimezone,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-kahra-dark text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Book a Session with {mentor.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Select Date</h4>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="bg-kahra-darker rounded-lg p-4"
              disabled={(date) => date < new Date()}
            />
            <div className="mt-4 text-sm text-gray-400">
              <p>Your timezone: {userTimezone}</p>
              <p>Mentor's timezone: {mentorTimezone}</p>
            </div>
          </div>

          <div className="space-y-6">
            {date && (
              <div>
                <h4 className="font-semibold mb-2">
                  Available Times for {format(date, "MMMM d, yyyy")}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_TIME_SLOTS.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      className="w-full"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

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
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!date || !selectedTime || !sessionType}
          >
            Book Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}