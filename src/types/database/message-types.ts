
/**
 * Defines structured message types for the career chat
 */

export interface MessageOption {
  id: string;
  text: string;
  icon?: string;          // Lucide icon name
  description?: string;   // Optional longer description
  category?: string;      // For semantic grouping
}

export interface MessageContent {
  intro?: string;        // Optional friendly intro
  question?: string;     // The actual question
  message?: string;      // For session_end messages
  options?: MessageOption[];  // Available options if any
  suggestions?: string[]; // For session_end suggestion options
}

export interface MessageProgress {
  category: string;      // e.g. "goals", "education", etc
  current: number;       // Current question in category
  total: number;         // Total questions in category
  overall: number;       // Overall progress 0-100
}

export interface MessageOptionsConfig {
  type: "single" | "multiple";
  layout: "buttons" | "cards" | "chips";
  allow_custom?: boolean;
}

export interface StructuredMessage {
  type: "conversation" | "question" | "recommendation" | "session_end";
  content: MessageContent;
  metadata: {
    progress?: MessageProgress;
    options?: MessageOptionsConfig;
    isSessionEnd?: boolean;
    completionType?: string;
  };
}
