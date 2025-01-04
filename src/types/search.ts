import type { Career } from "./database/careers";
import type { Major } from "./database/majors";
import type { Profile } from "./database/profiles";

export interface BaseSearchResult {
  id: string;
  title: string;
  description?: string;
  type: "career" | "major" | "mentor";
}

export interface CareerSearchResult extends BaseSearchResult {
  type: "career";
  salary_range?: string;
}

export interface MajorSearchResult extends BaseSearchResult {
  type: "major";
  degree_levels?: string[];
  career_opportunities?: string[];
}

export interface MentorSearchResult extends BaseSearchResult {
  type: "mentor";
  avatar_url?: string;
  position?: string;
  top_mentor?: boolean;
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