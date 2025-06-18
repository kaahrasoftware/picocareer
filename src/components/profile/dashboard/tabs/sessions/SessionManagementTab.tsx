import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Copy, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { UpdateStatusDialog } from "./dialogs/UpdateStatusDialog";
import { DeleteSessionDialog } from "./dialogs/DeleteSessionDialog";
import { MentorSession } from "@/types/database/session";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export function SessionManagementTab() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("scheduled_at");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>("");
  const { toast } = useToast();

  // Get all sessions with proper enum mapping
  const { data: allSessions = [], isLoading, refetch } = useQuery({
    queryKey: ['all-sessions', statusFilter, searchTerm, sortBy, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from('mentor_sessions')
        .select(`
          id,
          status,
          scheduled_at,
          notes,
          meeting_link,
          meeting_platform,
          mentor:profiles!mentor_sessions_mentor_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          mentee:profiles!mentor_sessions_mentee_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          session_type:session_types(
            type,
            duration
          )
        `);

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(`
          mentor.full_name.ilike.%${searchTerm}%,
          mentee.full_name.ilike.%${searchTerm}%,
          notes.ilike.%${searchTerm}%
        `);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;
      if (error) throw error;

      // Map the platform enum values to match the expected format
      const mappedData = data?.map(session => ({
        ...session,
        meeting_platform: mapPlatformEnum(session.meeting_platform)
      })) || [];

      return mappedData;
    },
  });

  // Helper function to map platform enum values
  const mapPlatformEnum = (platform: string | null): 'google_meet' | 'whatsapp' | 'telegram' | 'phone_call' | null => {
    if (!platform) return null;
    
    switch (platform) {
      case 'Google Meet':
        return 'google_meet';
      case 'WhatsApp':
        return 'whatsapp';
      case 'Telegram':
        return 'telegram';
      case 'Phone Call':
        return 'phone_call';
      default:
        return platform as 'google_meet' | 'whatsapp' | 'telegram' | 'phone_call';
    }
  };

  const handleStatusUpdate = (
    sessionId: string,
    sessionDetails: string,
    status: string
  ) => {
    setSelectedSessionId(sessionId);
    setSelectedSessionDetails(sessionDetails);
    setTargetStatus(status);
    setUpdateDialogOpen(true);
  };

  const handleSessionDelete = (sessionId: string, sessionDetails: string) => {
    setSelectedSessionId(sessionId);
    setSelectedSessionDetails(sessionDetails);
    setDeleteDialogOpen(true);
  };

  const handleCopyLink = (link: string | null) => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast({
        title: "Link copied",
        description: "The meeting link has been copied to your clipboard.",
      });
    } else {
      toast({
        title: "No link available",
        description: "There is no meeting link available for this session.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSuccess = () => {
    refetch();
  };

  const handleDeleteSuccess = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Session Management</h2>
        <p className="text-muted-foreground">
          Manage and monitor mentorship sessions
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <Input
          type="search"
          placeholder="Search sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-auto"
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-auto">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-sm font-medium">
            Sort By:
          </label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Scheduled At" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled_at">Scheduled At</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ascending" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session Details</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : allSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No sessions found.
                </TableCell>
              </TableRow>
            ) : (
              allSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <p className="font-medium">{session.session_type?.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.notes || "No notes provided"}
                    </p>
                    {session.meeting_link && (
                      <div className="mt-2 flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopyLink(session.meeting_link)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                        {session.meeting_platform && (
                          <Badge variant="outline">
                            {session.meeting_platform}
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={session.mentor?.avatar_url || "/avatars/01.png"}
                        alt={session.mentor?.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{session.mentor?.full_name}</p>
                        <p className="text-sm text-muted-foreground">Mentor</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-2">
                      <img
                        src={session.mentee?.avatar_url || "/avatars/02.png"}
                        alt={session.mentee?.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{session.mentee?.full_name}</p>
                        <p className="text-sm text-muted-foreground">Mentee</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        session.status === "completed"
                          ? "success"
                          : session.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(session.scheduled_at), "MMM dd, yyyy hh:mm a")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusUpdate(
                            session.id,
                            `${session.session_type?.type} with ${session.mentor?.full_name} and ${session.mentee?.full_name} on ${format(new Date(session.scheduled_at), "MMM dd, yyyy hh:mm a")}`,
                            session.status === "scheduled"
                              ? "completed"
                              : session.status === "completed"
                              ? "cancelled"
                              : "scheduled"
                          )
                        }
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleSessionDelete(
                            session.id,
                            `${session.session_type?.type} with ${session.mentor?.full_name} and ${session.mentee?.full_name} on ${format(new Date(session.scheduled_at), "MMM dd, yyyy hh:mm a")}`
                          )
                        }
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <UpdateStatusDialog
        isOpen={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        sessionId={selectedSessionId || ""}
        sessionDetails={selectedSessionDetails || ""}
        targetStatus={targetStatus}
        onSuccess={handleUpdateSuccess}
      />

      <DeleteSessionDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        sessionId={selectedSessionId || ""}
        sessionDetails={selectedSessionDetails || ""}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
