
import { z } from 'zod';
import { ContentType } from './utils';

export const EmailCampaignSchema = z.object({
  title: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().optional(),
  content_type: z.custom<ContentType>().optional(),
  content_ids: z.array(z.string()).optional(),
  recipient_type: z.string().default('all'),
  recipient_filter: z.record(z.any()).nullable().optional(),
  scheduled_for: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly')
});

export type EmailCampaignType = z.infer<typeof EmailCampaignSchema>;
