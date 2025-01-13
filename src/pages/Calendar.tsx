import { useEffect } from "react";
import { CalendarContainer } from "@/components/profile/calendar/CalendarContainer";

export function Calendar() {
  useEffect(() => {
    document.title = "Calendar | PicoCareer";
  }, []);

  return (
    <div className="container mx-auto py-8">
      <CalendarContainer />
    </div>
  );
}