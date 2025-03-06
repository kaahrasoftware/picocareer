
export type QuestionCategory = 'education' | 'skills' | 'workstyle' | 'goals';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionData {
  id: string;
  category: QuestionCategory;
  question: string;
  description?: string;
  options?: QuestionOption[];
  type: 'multiple-choice' | 'text' | 'likert';
}
