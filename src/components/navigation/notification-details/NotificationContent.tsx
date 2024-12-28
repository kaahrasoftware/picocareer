interface NotificationContentProps {
  message: string;
  isExpanded: boolean;
}

export function NotificationContent({ message, isExpanded }: NotificationContentProps) {
  // Get first sentence by splitting on first period, exclamation mark, or question mark
  const firstSentence = message.split(/[.!?]/)[0];
  
  if (isExpanded) {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p><span className="font-medium text-zinc-300">Mentor:</span> {message.match(/Mentor: ([^\n]+)/)?.[1] || 'N/A'}</p>
        <p><span className="font-medium text-zinc-300">Mentee:</span> {message.match(/Mentee: ([^\n]+)/)?.[1] || 'N/A'}</p>
        <p><span className="font-medium text-zinc-300">Start Time:</span> {message.match(/Start Time: ([^\n]+)/)?.[1] || 'N/A'}</p>
        <p><span className="font-medium text-zinc-300">Duration:</span> {message.match(/Duration: ([^\n]+)/)?.[1] || 'N/A'}</p>
        <p><span className="font-medium text-zinc-300">Platform:</span> {message.match(/Platform: ([^\n]+)/)?.[1] || 'N/A'}</p>
        {message.includes('Note:') && (
          <p><span className="font-medium text-zinc-300">Note:</span> {message.match(/Note: ([^\n]+)/)?.[1] || 'N/A'}</p>
        )}
      </div>
    );
  }

  return (
    <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
      {firstSentence}
    </p>
  );
}