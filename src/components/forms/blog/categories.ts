import { Database } from "@/integrations/supabase/types";

type Categories = Database["public"]["Enums"]["categories"];

export const categories: Categories[] = [
  "Technology",
  "Digital Tools",
  "Extracurricular Activities",
  "Success Stories",
  "Volunteerism",
  "Community Service",
  "Entrepreneurship",
  "Financial Literacy",
  "Arts Careers",
  "STEM Education",
  "STEM Careers",
  "Humanities Careers",
  "Diversity and Inclusion",
  "Educational Resources",
  "Leadership Development",
  "Mental Health",
  "Wellbeing",
  "High School to University Transition",
  "Study Abroad Preparation",
  "Personal Branding",
  "Internship and Job Search",
  "Networking Strategies",
  "Skill Development",
  "University Admissions",
  "Career Guidance"
];