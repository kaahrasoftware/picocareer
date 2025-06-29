
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Users, User } from 'lucide-react';
import { EventFormData } from '../types';

interface PlatformStepProps {
  form: UseFormReturn<EventFormData>;
}

export function PlatformStep({ form }: PlatformStepProps) {
  const eventType = form.watch('event_type');
  // Show platform fields for events that typically need virtual meeting platforms
  const showPlatformFields = eventType === 'Webinar' || eventType === 'Workshop';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Platform & Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {showPlatformFields && (
          <>
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Platform</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    You can add this later. Link will be sent to registered attendees.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="max_attendees"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Maximum Attendees
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="10000"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Set the maximum number of people who can register for this event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="facilitator"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Facilitator (Optional)
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Name of the person leading the event" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organized_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organized By (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Organization or department name" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
