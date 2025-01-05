import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserSessions } from "@/hooks/useUserSessions";
import { SessionList } from "./calendar/SessionList";
import { SessionCalendar } from "./calendar/SessionCalendar";
import type { Profile } from "@/types/database/profiles";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { upcomingSessions, pastSessions, isLoading } = useUserSessions(profile?.id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                <SessionList 
                  sessions={upcomingSessions} 
                  isLoading={isLoading}
                  emptyMessage="No upcoming sessions"
                />
              </TabsContent>
              <TabsContent value="past">
                <SessionList 
                  sessions={pastSessions}
                  isLoading={isLoading}
                  emptyMessage="No past sessions"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionCalendar 
            sessions={[...upcomingSessions, ...pastSessions]}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}