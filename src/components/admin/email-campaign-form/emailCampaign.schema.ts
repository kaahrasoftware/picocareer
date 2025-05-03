
import { z } from 'zod';

export const EmailCampaignSchema = z.object({
  title: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().optional(),
  content_type: z.string().optional(),
  content_ids: z.array(z.string()).optional(),
  recipient_type: z.string().default('all'),
  recipients: z.array(z.string()).optional(),
  recipient_filter: z.string().nullable().optional(),
  scheduled_for: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly')
});

export type EmailCampaignType = z.infer<typeof EmailCampaignSchema>;
