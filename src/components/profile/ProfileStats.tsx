interface ProfileStatsProps {
  menteeCount: number;
  connectionCount: number;
  recordingCount: number;
}

export function ProfileStats({ menteeCount, connectionCount, recordingCount }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div className="text-center">
        <p className="text-xl font-bold">{menteeCount}</p>
        <p className="text-xs text-gray-400 dark:text-gray-400">Mentees</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold">{connectionCount}</p>
        <p className="text-xs text-gray-400 dark:text-gray-400">K-onnected</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold">{recordingCount}</p>
        <p className="text-xs text-gray-400 dark:text-gray-400">Recordings</p>
      </div>
    </div>
  );
}