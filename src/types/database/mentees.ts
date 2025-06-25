
export interface MenteeEssay {
  id: string;
  prompt_id: string;
  response_text: string;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
  word_count: number;
  version: number;
}
