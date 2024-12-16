import type { Career } from "./database/careers";
import type { Major } from "./database/majors";
import type { Profile } from "./database/profiles";

// Base interface for all search results
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
  degree_level: string | null;
}

export interface MentorSearchResult extends BaseSearchResult {
  type: "mentor";
  avatar_url: string | null;
  position: string | null;
}

export type SearchResult = CareerSearchResult | MajorSearchResult | MentorSearchResult;