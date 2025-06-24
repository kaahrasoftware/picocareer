
import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MentorSession } from "@/types/database/session";

interface SessionTableProps {
  sessions: MentorSession[];
  isLoading: boolean;
  refetch: () => void;
}

export function SessionTable({ sessions, isLoading, refetch }: SessionTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No sessions found.</p>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'no_show':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Mentor</TableHead>
            <TableHead>Mentee</TableHead>
            <TableHead>Session Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Platform</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                {format(new Date(session.scheduled_at), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {session.mentor.avatar_url && (
                    <img 
                      src={session.mentor.avatar_url} 
                      alt={session.mentor.full_name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium">{session.mentor.full_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {session.mentee.avatar_url && (
                    <img 
                      src={session.mentee.avatar_url} 
                      alt={session.mentee.full_name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium">{session.mentee.full_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{session.session_type.type}</div>
                  <div className="text-sm text-muted-foreground">
                    {session.session_type.duration} min
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(session.status)}>
                  {session.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                {session.meeting_platform ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">{session.meeting_platform}</span>
                    {session.meeting_link && (
                      <a 
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
