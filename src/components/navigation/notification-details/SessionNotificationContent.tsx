import { formatInTimeZone } from 'date-fns-tz';
import type { MentorSession } from '@/types/calendar';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useMentorTimezone } from '@/hooks/useMentorTimezone';

interface SessionNotificationContentProps {
  sessionData: MentorSession;
}

export function SessionNotificationContent({ sessionData }: SessionNotificationContentProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const userTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data: mentorTimezone } = useMentorTimezone(sessionData.mentor.id);

  // Ensure we have a valid date object
  const scheduledTime = new Date(sessionData.scheduled_at);
  if (isNaN(scheduledTime.getTime())) {
    console.error('Invalid scheduled_at date:', sessionData.scheduled_at);
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p className="text-red-500">Error: Invalid session date</p>
      </div>
    );
  }

  // Ensure we have valid timezones
  const validMentorTimezone = mentorTimezone || 'UTC';
  const validUserTimezone = userTimezone || 'UTC';

  try {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p><span className="font-medium text-zinc-300">Mentor:</span> {sessionData.mentor?.full_name}</p>
        <p><span className="font-medium text-zinc-300">Mentee:</span> {sessionData.mentee?.full_name}</p>
        <div className="space-y-1">
          <p><span className="font-medium text-zinc-300">Session Time:</span></p>
          <div className="pl-4 space-y-1">
            <p>
              <span className="text-zinc-300">Mentor's time ({validMentorTimezone}):</span>{' '}
              {formatInTimeZone(scheduledTime, validMentorTimezone, 'PPP p')}
            </p>
            <p>
              <span className="text-zinc-300">Your time ({validUserTimezone}):</span>{' '}
              {formatInTimeZone(scheduledTime, validUserTimezone, 'PPP p')}
            </p>
          </div>
        </div>
        <p><span className="font-medium text-zinc-300">Session Type:</span> {sessionData.session_type?.type}</p>
        <p><span className="font-medium text-zinc-300">Duration:</span> {sessionData.session_type?.duration} minutes</p>
        <p><span className="font-medium text-zinc-300">Platform:</span> {sessionData.meeting_platform}</p>
        {sessionData.meeting_link && (
          <p>
            <span className="font-medium text-zinc-300">Meeting Link:</span>{' '}
            <a 
              href={sessionData.meeting_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 hover:underline"
            >
              Join Meeting
            </a>
          </p>
        )}
        {sessionData.notes && (
          <p><span className="font-medium text-zinc-300">Note:</span> {sessionData.notes}</p>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error formatting session time:', error);
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p className="text-red-500">Error displaying session details</p>
      </div>
    );
  }
}