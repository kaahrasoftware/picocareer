
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
}

export function RegistrationsTable({ registrations, isLoading }: RegistrationTableProps) {
  return (
    <div className="border rounded-md overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
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
              <TableCell colSpan={8} className="h-24 text-center">
                Loading registrations...
              </TableCell>
            </TableRow>
          ) : registrations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No registrations found.
              </TableCell>
            </TableRow>
          ) : (
            registrations.map((registration) => (
              <TableRow key={registration.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {registration.events?.title || 'Unknown Event'}
                </TableCell>
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
                  <Badge variant={registration.status === 'registered' ? 'default' : 'outline'}>
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
