import * as z from "zod";

export const careerFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image_url: z.string().optional(),
  salary_range: z.string().optional(),
  featured: z.boolean().optional(),
  academic_majors: z.string().optional(),
  required_skills: z.string().optional(),
  required_tools: z.string().optional(),
  job_outlook: z.string().optional(),
  industry: z.string().optional(),
  work_environment: z.string().optional(),
  growth_potential: z.string().optional(),
  keywords: z.string().optional(),
  transferable_skills: z.string().optional(),
  careers_to_consider_switching_to: z.string().optional(),
  required_education: z.string().optional(),
  stress_levels: z.string().optional(),
  rare: z.boolean().optional(),
  popular: z.boolean().optional(),
  new_career: z.boolean().optional(),
});

export type CareerFormValues = z.infer<typeof careerFormSchema>;