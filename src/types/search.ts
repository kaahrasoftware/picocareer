import type { Career } from "./database/careers";
import type { Major } from "./database/majors";
import type { Profile } from "./database/profiles";

interface BaseSearchResult {
  id: string;
  title: string;
  description: string | null;
  image_url?: string | null;
}

export interface CareerSearchResult extends BaseSearchResult {
  type: "career";
  salary_range: string | null;
  average_salary: number | null;
}

export interface MajorSearchResult extends BaseSearchResult {
  type: "major";
  field_of_study: string | null;
  degree_levels: string[];
  career_opportunities: string[];
  required_courses: string[];
}

export interface MentorSearchResult extends BaseSearchResult {
  type: "mentor";
  avatar_url: string | null;
  position: string | null;
}

export type SearchResult = CareerSearchResult | MajorSearchResult | MentorSearchResult;

// Type guards
export const isCareerResult = (result: SearchResult): result is CareerSearchResult => {
  return result.type === "career";
};

export const isMajorResult = (result: SearchResult): result is MajorSearchResult => {
  return result.type === "major";
};

export const isMentorResult = (result: SearchResult): result is MentorSearchResult => {
  return result.type === "mentor";
};