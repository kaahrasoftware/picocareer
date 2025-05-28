
import { z } from 'zod';

export const partnershipApplicationSchema = z.object({
  partner_type: z.enum(['university', 'high_school', 'trade_school', 'organization', 'individual', 'company', 'nonprofit']),
  organization_name: z.string().min(2, 'Organization name must be at least 2 characters'),
  contact_name: z.string().min(2, 'Contact name must be at least 2 characters'),
  contact_email: z.string().email('Please enter a valid email address'),
  contact_phone: z.string().optional(),
  contact_title: z.string().optional(),
  organization_size: z.string().optional(),
  location: z.object({
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  website: z.string().url().optional().or(z.literal('')),
  established_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  focus_areas: z.array(z.string()).optional(),
  current_programs: z.string().optional(),
  accreditation_info: z.string().optional(),
  partnership_goals: z.string().min(50, 'Please provide at least 50 characters describing your partnership goals'),
  collaboration_areas: z.array(z.string()).optional(),
  expected_outcomes: z.string().optional(),
  student_population: z.number().min(0).optional(),
  target_audience: z.string().optional(),
  supporting_documents: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
});

export type PartnershipApplicationFormData = z.infer<typeof partnershipApplicationSchema>;
