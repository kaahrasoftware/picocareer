
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface EventRankingTableProps {
  events: {
    id: string;
    title: string;
    registrationCount: number;
  }[];
  isLoading: boolean;
}

export function EventRankingTable({ events, isLoading }: EventRankingTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No event ranking data available
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Event Name</TableHead>
          <TableHead className="text-right">Registrations</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event, index) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">
              {index + 1}
            </TableCell>
            <TableCell>
              {event.title}
              {index === 0 && <Badge className="ml-2 bg-amber-500">Top</Badge>}
            </TableCell>
            <TableCell className="text-right">
              <span className="font-semibold">{event.registrationCount}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
