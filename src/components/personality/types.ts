
export interface TestResult {
  personality_traits: string[];
  career_matches: Array<{ title: string; reasoning: string }>;
  major_matches: Array<{ title: string; reasoning: string }>;
  skill_development: string[];
}

export type PersonalityTestResult = {
  personality_traits: string | string[] | string[][];
  career_matches: string;
  major_matches: string;
  skill_development: string;
}

export type PersonalityType = {
  type: string;
  title: string;
  dicotomy_description: string[];
  who_they_are: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
}
