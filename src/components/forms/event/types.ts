
import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().min(1, 'Event description is required'),
  start_time: z.string().min(1, 'Start date and time is required'),
  end_time: z.string().min(1, 'End date and time is required'),
  timezone: z.string().default('EST'),
  max_attendees: z.number().min(1, 'Maximum attendees must be at least 1'),
  event_type: z.enum(['Coffee Time', 'Hackathon', 'Panel', 'Webinar', 'Workshop']),
  platform: z.enum(['Google Meet', 'Zoom', 'Microsoft Teams', 'Other']).default('Google Meet'),
  meeting_link: z.string().url().optional().or(z.literal('')),
  facilitator: z.string().optional(),
  organized_by: z.string().optional(),
  thumbnail_url: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventFormSchema>;

export interface EventFormStep {
  id: string;
  title: string;
  description: string;
  fields: (keyof EventFormData)[];
}

export const eventFormSteps: EventFormStep[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Event title, description, and image',
    fields: ['title', 'description', 'thumbnail_url']
  },
  {
    id: 'schedule',
    title: 'Schedule & Details',
    description: 'When your event will take place and event type',
    fields: ['start_time', 'end_time', 'timezone', 'event_type']
  },
  {
    id: 'platform',
    title: 'Platform & Settings',
    description: 'Platform, capacity, and additional details',
    fields: ['platform', 'meeting_link', 'max_attendees', 'facilitator', 'organized_by']
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your event details before publishing',
    fields: []
  }
];
