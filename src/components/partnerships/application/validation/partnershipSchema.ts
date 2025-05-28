
import { z } from 'zod';

export const partnershipApplicationSchema = z.object({
  partner_type: z.enum(['university', 'high_school', 'trade_school', 'organization', 'individual', 'company', 'nonprofit']),
  organization_name: z.string().min(1, 'Organization name is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Please enter a valid email address'),
  contact_phone: z.string().optional(),
  contact_title: z.string().optional(),
  organization_size: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  established_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  focus_areas: z.array(z.string()).default([]),
  current_programs: z.string().optional(),
  accreditation_info: z.string().optional(),
  partnership_goals: z.string().min(1, 'Partnership goals are required'),
  collaboration_areas: z.array(z.string()).default([]),
  expected_outcomes: z.string().optional(),
  student_population: z.number().optional(),
  target_audience: z.string().optional(),
  supporting_documents: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).default([]),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export type PartnershipApplicationFormData = z.infer<typeof partnershipApplicationSchema>;
