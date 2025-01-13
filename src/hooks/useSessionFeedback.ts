import { create } from 'zustand';

interface SessionFeedbackStore {
  isOpen: boolean;
  sessionId: string | null;
  feedbackType: 'mentor_feedback' | 'mentee_feedback' | null;
  fromProfileId: string | null;
  toProfileId: string | null;
  openFeedbackDialog: (params: {
    sessionId: string;
    feedbackType: 'mentor_feedback' | 'mentee_feedback';
    fromProfileId: string;
    toProfileId: string;
  }) => void;
  closeFeedbackDialog: () => void;
}

export const useSessionFeedback = create<SessionFeedbackStore>((set) => ({
  isOpen: false,
  sessionId: null,
  feedbackType: null,
  fromProfileId: null,
  toProfileId: null,
  openFeedbackDialog: (params) => set({
    isOpen: true,
    sessionId: params.sessionId,
    feedbackType: params.feedbackType,
    fromProfileId: params.fromProfileId,
    toProfileId: params.toProfileId,
  }),
  closeFeedbackDialog: () => set({
    isOpen: false,
    sessionId: null,
    feedbackType: null,
    fromProfileId: null,
    toProfileId: null,
  }),
}));