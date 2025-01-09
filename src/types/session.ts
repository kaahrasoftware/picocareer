import { type MeetingPlatform, type SessionType } from './database/enums';

export interface SessionTypeFormData {
  type: SessionType;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
}

export type { MeetingPlatform, SessionType };