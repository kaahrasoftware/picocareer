import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TimeInput } from "@/components/ui/time-input";
import { useAvailability } from "@/hooks/useAvailability";
import { cn } from "@/lib/utils";

interface AvailabilityManagerProps {
  profileId: string;
  onUpdate: () => void;
}

export function AvailabilityManager({ profileId, onUpdate }: AvailabilityManagerProps) {
  const { toast } = useToast();
  const {
    selectedDate,
    setSelectedDate,
    availableTimeSlots,
    addTimeSlot,
    removeTimeSlot,
    isLoading,
    recurringEnabled,
    setRecurringEnabled,
    weeklySchedule,
    updateWeeklySchedule,
    selectedDays,
    toggleSelectedDay,
  } = useAvailability(profileId);

  useEffect(() => {
    const checkTimezone = async () => {
      try {
        // Check if a timezone setting exists for this user
        const { count, error } = await supabase
          .from('user_settings')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId)
          .eq('setting_type', 'timezone');

        // Log the query results
        console.log('Timezone check results:', {
          profileId,
          count,
          error
        });

        if (error) {
          console.error('Error checking timezone:', error);
          return;
        }

        // Only show toast if count is explicitly 0
        if (count === 0) {
          console.log('No timezone setting found, showing toast');
          toast({
            title: "Timezone not set",
            description: "Please set your timezone in settings to ensure accurate scheduling.",
            variant: "destructive",
          });
        } else {
          console.log('Timezone setting exists, count:', count);
        }
      } catch (error) {
        console.error('Error checking timezone:', error);
      }
    };

    checkTimezone();
  }, [profileId, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Availability</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center space-x-4">
            <Switch
              id="recurring"
              checked={recurringEnabled}
              onCheckedChange={setRecurringEnabled}
            />
            <Label htmlFor="recurring">Enable Recurring Schedule</Label>
          </div>

          {recurringEnabled ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <Button
                    key={day}
                    variant={selectedDays.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSelectedDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>

              {selectedDays.map((day) => (
                <div key={day} className="space-y-2">
                  <h4 className="font-medium">{day}</h4>
                  <div className="flex items-center space-x-4">
                    <TimeInput
                      value={weeklySchedule[day]?.start || "09:00"}
                      onChange={(value) =>
                        updateWeeklySchedule(day, { start: value, end: weeklySchedule[day]?.end || "17:00" })
                      }
                    />
                    <span>to</span>
                    <TimeInput
                      value={weeklySchedule[day]?.end || "17:00"}
                      onChange={(value) =>
                        updateWeeklySchedule(day, { start: weeklySchedule[day]?.start || "09:00", end: value })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className={cn("rounded-md border")}
                />
              </div>

              {selectedDate && (
                <div className="space-y-4">
                  <h4 className="font-medium">Available Time Slots</h4>
                  <div className="space-y-2">
                    {availableTimeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <TimeInput
                          value={slot.start}
                          onChange={(value) => addTimeSlot({ start: value, end: slot.end })}
                        />
                        <span>to</span>
                        <TimeInput
                          value={slot.end}
                          onChange={(value) => addTimeSlot({ start: slot.start, end: value })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addTimeSlot({ start: "09:00", end: "17:00" })}
                    >
                      Add Time Slot
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}