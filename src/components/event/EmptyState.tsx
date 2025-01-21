interface EmptyStateProps {
  filter: 'upcoming' | 'past';
}

export function EmptyState({ filter }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold">No {filter} Events</h3>
      <p className="text-muted-foreground">
        {filter === 'upcoming' 
          ? "Check back later for new events" 
          : "There are no past events to display"}
      </p>
    </div>
  );
}