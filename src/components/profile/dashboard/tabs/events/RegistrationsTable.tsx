
import { format } from 'date-fns';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface RegistrationTableProps {
  registrations: any[];
  isLoading: boolean;
  selectedEvent: string;
}

export function RegistrationsTable({ 
  registrations, 
  isLoading, 
  selectedEvent 
}: RegistrationTableProps) {
  const showEventColumn = selectedEvent === 'all';
  
  return (
    <div className="border rounded-md overflow-auto bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            {showEventColumn && <TableHead>Event</TableHead>}
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Academic Field/Position</TableHead>
            <TableHead>School/Company</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={showEventColumn ? 8 : 7} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading registrations...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : registrations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showEventColumn ? 8 : 7} className="h-24 text-center">
                <p className="text-muted-foreground">No registrations found.</p>
                <p className="text-xs text-muted-foreground mt-1">Try changing your search criteria.</p>
              </TableCell>
            </TableRow>
          ) : (
            registrations.map((registration) => (
              <TableRow key={registration.id} className="hover:bg-muted/50">
                {showEventColumn && (
                  <TableCell className="font-medium">
                    {registration.events?.title || 'Unknown Event'}
                  </TableCell>
                )}
                <TableCell>
                  {registration.first_name} {registration.last_name}
                </TableCell>
                <TableCell>{registration.email}</TableCell>
                <TableCell>
                  {format(new Date(registration.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{registration.country || 'Not specified'}</TableCell>
                <TableCell>{registration["current academic field/position"] || 'Not specified'}</TableCell>
                <TableCell>{registration["current school/company"] || 'Not specified'}</TableCell>
                <TableCell>
                  <Badge variant={registration.status === 'registered' ? 'success' : 'outline'}>
                    {registration.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
