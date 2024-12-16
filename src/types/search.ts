import type { Career } from "./database/careers";
import type { Major } from "./database/majors";
import type { Profile } from "./database/profiles";

export type SearchResultBase = {
  id: string;
  title: string;
  description: string | null;
  image_url?: string | null;
};

export type CareerSearchResult = SearchResultBase & Career & {
  type: "career";
};

export type MajorSearchResult = SearchResultBase & Major & {
  type: "major";
};

export type MentorSearchResult = SearchResultBase & Omit<Profile, "title" | "description"> & {
  type: "mentor";
};

export type SearchResult = CareerSearchResult | MajorSearchResult | MentorSearchResult;