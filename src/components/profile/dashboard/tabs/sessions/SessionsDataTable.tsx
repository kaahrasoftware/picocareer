
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSessionDetailsDialog } from "./AdminSessionDetailsDialog";
import type { MentorSession } from "@/types/database/session";

interface SessionsDataTableProps {
  sessions: MentorSession[];
  isLoading: boolean;
}

export function SessionsDataTable({ sessions, isLoading }: SessionsDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("scheduled_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "completed":
        return <Badge variant="success" className="flex gap-1 items-center">
          <CheckCircle className="h-3 w-3" /> Completed
        </Badge>;
      case "scheduled":
        return <Badge variant="outline" className="flex gap-1 items-center">
          Scheduled
        </Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="flex gap-1 items-center">
          <XCircle className="h-3 w-3" /> Cancelled
        </Badge>;
      case "no-show":
        return <Badge variant="warning" className="flex gap-1 items-center">
          <AlertTriangle className="h-3 w-3" /> No-show
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    return (
      session.mentor.full_name.toLowerCase().includes(query) ||
      session.mentee.full_name.toLowerCase().includes(query) ||
      session.session_type.type.toLowerCase().includes(query)
    );
  });
  
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (sortBy === "scheduled_at") {
      const dateA = new Date(a.scheduled_at).getTime();
      const dateB = new Date(b.scheduled_at).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    if (sortBy === "mentor") {
      return sortDirection === "asc" 
        ? a.mentor.full_name.localeCompare(b.mentor.full_name)
        : b.mentor.full_name.localeCompare(a.mentor.full_name);
    }
    
    if (sortBy === "mentee") {
      return sortDirection === "asc" 
        ? a.mentee.full_name.localeCompare(b.mentee.full_name)
        : b.mentee.full_name.localeCompare(a.mentee.full_name);
    }
    
    if (sortBy === "type") {
      return sortDirection === "asc" 
        ? a.session_type.type.localeCompare(b.session_type.type)
        : b.session_type.type.localeCompare(a.session_type.type);
    }
    
    if (sortBy === "status") {
      return sortDirection === "asc" 
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("scheduled_at")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Date/Time
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("mentor")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Mentor
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("mentee")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Mentee
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("type")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Session Type
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Duration</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : sortedSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No sessions found.
                </TableCell>
              </TableRow>
            ) : (
              sortedSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    {format(new Date(session.scheduled_at), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>
                    {session.mentor.full_name}
                  </TableCell>
                  <TableCell>
                    {session.mentee.full_name}
                  </TableCell>
                  <TableCell>
                    {session.session_type.type}
                  </TableCell>
                  <TableCell>
                    {session.session_type.duration} min
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(session.status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedSession(session)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {selectedSession && (
        <AdminSessionDetailsDialog 
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
