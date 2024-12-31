interface TimeGridLinesProps {
  cellHeight: number;
}

export function TimeGridLines({ cellHeight }: TimeGridLinesProps) {
  const intervals = Array.from({ length: 48 }, (_, i) => i); // 24 hours * 2 (30-min intervals)

  return (
    <div className="absolute inset-0 pointer-events-none">
      {intervals.map((interval) => (
        <div
          key={interval}
          className="border-t border-border/50"
          style={{
            position: "absolute",
            top: `${interval * cellHeight}px`,
            left: 0,
            right: 0,
            height: `${cellHeight}px`,
          }}
        />
      ))}
    </div>
  );
}