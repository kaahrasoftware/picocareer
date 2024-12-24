import * as z from "zod";
import { Database } from "@/integrations/supabase/types";

type Categories = Database["public"]["Enums"]["categories"];
type Subcategories = Database["public"]["Enums"]["subcategories"];

export const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  cover_image_url: z.string().optional(),
  categories: z.array(z.string() as z.ZodType<Categories>).optional(),
  subcategories: z.array(z.string() as z.ZodType<Subcategories>).optional(),
  other_notes: z.string().optional(),
  is_recent: z.boolean().optional()
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;