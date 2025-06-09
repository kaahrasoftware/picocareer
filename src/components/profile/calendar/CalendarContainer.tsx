
// Fix the calendar container component to remove day_range_middle
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMentorAvailability } from "@/hooks/useMentorAvailability";
import { useMentorUpcomingSessions } from "@/hooks/useMentorUpcomingSessions";
import { cn } from "@/lib/utils";
import { addMonths, subMonths, format, isToday } from "date-fns";
import { CalendarDayDisplay } from "./CalendarDayDisplay";
import { SessionCard } from "./SessionCard";

interface CalendarContainerProps {
  profileId: string;
}

export function CalendarContainer({ profileId }: CalendarContainerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState(new Date());
  const [showDate, setShowDate] = useState<Date | null>(null);
  
  const { data: availabilityData } = useMentorAvailability(profileId);
  const { data: upcomingSessions } = useMentorUpcomingSessions(profileId);

  const goToPreviousMonth = () => {
    setMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setMonth(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setMonth(today);
    setSelectedDate(today);
    setShowDate(today);
  };

  useEffect(() => {
    if (selectedDate) {
      setShowDate(selectedDate);
    }
  }, [selectedDate]);

  // Format the available dates from the availability data
  const availableDates = availabilityData ? availabilityData.map(date => 
    new Date(date.start_date_time)
  ) : [];

  // Format the dates with booked sessions
  const bookedDates = upcomingSessions ? upcomingSessions.map(session => 
    new Date(session.start_time)
  ) : [];

  const hasEvents = (date: Date): boolean => {
    const dateString = format(date, 'yyyy-MM-dd');
    return availableDates.some(d => format(d, 'yyyy-MM-dd') === dateString) ||
           bookedDates.some(d => format(d, 'yyyy-MM-dd') === dateString);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="text-lg font-semibold">
              {format(month, 'MMMM yyyy')}
            </h3>
            <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
          </div>

          <div className="flex mb-4">
            <Badge variant="outline" className="flex items-center gap-1 mr-2">
              <span className="h-3 w-3 rounded-full bg-primary-foreground"></span>
              Today
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 mr-2">
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
              Available
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-blue-500"></span>
              Booked
            </Badge>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md"
            modifiers={{
              today: isToday,
              booked: (date) => bookedDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')),
              available: (date) => availableDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')),
            }}
            modifiersClassNames={{
              today: "bg-primary-foreground text-foreground",
              booked: "bg-blue-100 text-blue-800",
              available: "bg-green-100 text-green-800",
            }}
            components={{
              Day: (props) => {
                const hasEventDot = hasEvents(props.date);
                return (
                  <div className={cn(
                    "relative",
                    props.className
                  )}>
                    {props.day}
                    {hasEventDot && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-foreground"></div>
                    )}
                  </div>
                );
              }
            }}
          />
        </CardContent>
      </Card>

      {showDate && (
        <CalendarDayDisplay 
          date={showDate}
          profileId={profileId}
        />
      )}

      {/* Upcoming Sessions */}
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
        {upcomingSessions && upcomingSessions.length > 0 ? (
          upcomingSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No upcoming sessions scheduled.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
