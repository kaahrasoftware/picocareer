import React from 'react';
import type { MentorSession } from '@/types/calendar';

interface SessionNotificationContentProps {
  sessionData: MentorSession;
}

export function SessionNotificationContent({ sessionData }: SessionNotificationContentProps) {
  return (
    <div className="space-y-2 mt-3 text-sm text-zinc-400">
      <p><span className="font-medium text-zinc-300">Mentor:</span> {sessionData.mentor?.full_name}</p>
      <p><span className="font-medium text-zinc-300">Mentee:</span> {sessionData.mentee?.full_name}</p>
      <p><span className="font-medium text-zinc-300">Start Time:</span> {new Date(sessionData.scheduled_at).toLocaleString()}</p>
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
}