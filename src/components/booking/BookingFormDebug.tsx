import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserSettings } from "@/hooks/useUserSettings";
import { TimeSlotSelector } from "./TimeSlotSelector";

interface BookingFormProps {
  mentorId: string;
  onBookingComplete: () => void;
}

export function BookingFormDebug({ mentorId, onBookingComplete }: BookingFormProps) {
  const [selectedSessionType, setSelectedSessionType] = useState<{ id: string; type: string; duration: number; price: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const userTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const sessionTypes = [
    { id: "1", type: "30-Minute Session", duration: 30, price: 50 },
    { id: "2", type: "60-Minute Session", duration: 60, price: 100 },
    { id: "3", type: "90-Minute Session", duration: 90, price: 150 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSessionType) {
      toast({
        title: "Error",
        description: "Please select a session type",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTime) {
      toast({
        title: "Error",
        description: "Please select a time",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Booking Confirmed for ${format(selectedDate, 'PPP')} at ${selectedTime} ${userTimezone}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="session-type" className="block text-sm font-medium mb-2">
          Session Type
        </Label>
        <Select onValueChange={(value) => {
          const session = sessionTypes.find(s => s.id === value);
          setSelectedSessionType(session || null);
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a session type" />
          </SelectTrigger>
          <SelectContent>
            {sessionTypes.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.type} - ${session.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="date" className="block text-sm font-medium mb-2">
          Date
        </Label>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
      </div>

      {selectedDate && selectedSessionType && (
        <div>
          <label className="block text-sm font-medium mb-2">Available Times</label>
          <TimeSlotSelector
            selectedDate={selectedDate}
            mentorId={mentorId}
            selectedTime={selectedTime}
            onTimeSelect={setSelectedTime}
            selectedSessionType={selectedSessionType}
          />
        </div>
      )}

      <div>
        <Label htmlFor="notes" className="block text-sm font-medium mb-2">
          Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Any specific topics you'd like to cover?"
          rows={3}
          className="w-full rounded-md border"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit}>Confirm Booking</Button>
    </div>
  );
}
