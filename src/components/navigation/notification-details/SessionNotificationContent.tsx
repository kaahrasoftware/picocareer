
import { formatInTimeZone } from 'date-fns-tz';
import type { MentorSession } from '@/types/calendar';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useMentorTimezone } from '@/hooks/useMentorTimezone';
import { Skeleton } from "@/components/ui/skeleton";

interface SessionNotificationContentProps {
  sessionData: MentorSession;
}

export function SessionNotificationContent({ sessionData }: SessionNotificationContentProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const menteeTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data: mentorTimezone, isLoading, error } = useMentorTimezone(sessionData.mentor?.id);

  // Add debug logs for timezone values
  console.log('Session Notification Debug:', {
    sessionDataMentorId: sessionData.mentor?.id,
    mentorTimezone,
    sessionDataMenteeId: sessionData.mentee?.id,
    currentProfileId: profile?.id,
    menteeTimezone,
    scheduledTime: sessionData.scheduled_at,
    browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Ensure we have a valid date object
  const scheduledTime = new Date(sessionData.scheduled_at);
  if (isNaN(scheduledTime.getTime())) {
    console.error('Invalid scheduled_at date:', sessionData.scheduled_at);
    return (
      <div className="space-y-2 mt-3 text-sm">
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-red-500">Error: Invalid session date</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 mt-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (error) {
    console.error('Error fetching mentor timezone:', error);
    return (
      <div className="space-y-2 mt-3 text-sm">
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-red-500">Error loading session details. Please try again later.</p>
        </div>
      </div>
    );
  }

  const displayMentorTimezone = mentorTimezone || 'UTC';
  const displayMenteeTimezone = menteeTimezone || 'UTC';

  try {
    return (
      <div className="space-y-3 mt-3 text-sm text-zinc-400">
        <div className="flex flex-col gap-2 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-md">
          <p><span className="font-medium text-zinc-300">Mentor:</span> {sessionData.mentor?.full_name}</p>
          <p><span className="font-medium text-zinc-300">Mentee:</span> {sessionData.mentee?.full_name}</p>
        </div>

        <div className="space-y-2 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-md">
          <p className="font-medium text-zinc-300">Session Time:</p>
          <div className="pl-4 space-y-2">
            <p>
              <span className="text-zinc-300">Mentor's time ({displayMentorTimezone}):</span>{' '}
              {formatInTimeZone(scheduledTime, displayMentorTimezone, 'PPP p')}
            </p>
            <p>
              <span className="text-zinc-300">Mentee's time ({displayMenteeTimezone}):</span>{' '}
              {formatInTimeZone(scheduledTime, displayMenteeTimezone, 'PPP p')}
            </p>
          </div>
        </div>

        <div className="space-y-2 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-md">
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
        </div>

        {sessionData.notes && (
          <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-md">
            <p><span className="font-medium text-zinc-300">Note:</span> {sessionData.notes}</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error formatting session time:', error);
    return (
      <div className="space-y-2 mt-3 text-sm">
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-red-500">Error displaying session details. Please try again later.</p>
        </div>
      </div>
    );
  }
}
