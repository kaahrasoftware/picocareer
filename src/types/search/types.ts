export type SearchResultBase = {
  id: string;
  type: 'major' | 'career' | 'mentor';
  title: string;
  description: string;
};

export type MajorSearchResult = SearchResultBase & {
  type: 'major';
  degree_levels: string[];
  career_opportunities: string[];
  common_courses: string[];
};

export type CareerSearchResult = SearchResultBase & {
  type: 'career';
  salary_range: string | null;
};

export type MentorSearchResult = SearchResultBase & {
  type: 'mentor';
  avatar_url: string | null;
  position: string | null;
  company_name?: string;
  skills: string[] | null;
  tools: string[] | null;
  keywords: string[] | null;
  fields_of_interest: string[] | null;
};

export type SearchResult = MajorSearchResult | CareerSearchResult | MentorSearchResult;

export const isMentorResult = (result: SearchResult): result is MentorSearchResult => 
  result.type === 'mentor';

export const isCareerResult = (result: SearchResult): result is CareerSearchResult => 
  result.type === 'career';

export const isMajorResult = (result: SearchResult): result is MajorSearchResult => 
  result.type === 'major';