
import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar, ImageIcon } from 'lucide-react';
import { EventFormData } from '../types';
import { StableRichTextEditor } from '../components/StableRichTextEditor';
import { EventImageUpload } from '../components/EventImageUpload';

interface BasicInfoStepProps {
  form: UseFormReturn<EventFormData>;
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Basic Event Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter a compelling event title" 
                  {...field} 
                  className="text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Event Description</FormLabel>
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <StableRichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Describe your event in detail. What will attendees learn? What should they expect?"
                />
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Event Image
          </FormLabel>
          <EventImageUpload
            value={form.watch('thumbnail_url') || ''}
            onChange={(url) => form.setValue('thumbnail_url', url)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
