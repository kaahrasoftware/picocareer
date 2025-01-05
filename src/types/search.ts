export interface BaseSearchResult {
  id: string;
  type: 'mentor' | 'career' | 'major';
  title: string;
  description?: string;
}

export interface MentorSearchResult extends BaseSearchResult {
  type: 'mentor';
  avatar_url?: string;
  top_mentor?: boolean;
  position?: string;
  career?: { title: string } | null;
  location?: string;
  company?: { name: string } | null;
}

export interface CareerSearchResult extends BaseSearchResult {
  type: 'career';
  salary_range?: string;
  image_url?: string;
  academic_majors?: string[];
}

export interface MajorSearchResult extends BaseSearchResult {
  type: 'major';
  degree_levels?: string[];
  common_courses?: string[];
  career_opportunities?: string[];
}

export type SearchResult = MentorSearchResult | CareerSearchResult | MajorSearchResult;

// Type guards
export const isMentorResult = (result: SearchResult): result is MentorSearchResult => {
  return result.type === 'mentor';
};

export const isCareerResult = (result: SearchResult): result is CareerSearchResult => {
  return result.type === 'career';
};

export const isMajorResult = (result: SearchResult): result is MajorSearchResult => {
  return result.type === 'major';
};