import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { UserProfileDetailsDialog } from "@/components/admin/UserProfileDetailsDialog";
import type { OnboardingStatus, UserType } from "@/types/database/enums";
import { DateRangeFilter } from "@/components/admin/filters/DateRangeFilter";
import { endOfDay, startOfDay } from "date-fns";

interface User {
  id: string;
  full_name: string | null;
  email: string;
  user_type: UserType;
  onboarding_status: OnboardingStatus;
  created_at: string;
}

const userTypeColors: Record<UserType, string> = {
  mentor: "text-[#9b87f5]",
  mentee: "text-[#7E69AB]",
  admin: "text-[#6E59A5]",
  editor: "text-[#D946EF]"
};

const statusColors: Record<OnboardingStatus, string> = {
  "Pending": "text-orange-500",
  "Under Review": "text-blue-500",
  "Consent Signed": "text-purple-500",
  "Approved": "text-green-500",
  "Rejected": "text-red-500"
};

export function UsersTab() {
  const { toast } = useToast();
  const [selectedUserType, setSelectedUserType] = useState<"all" | UserType>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | OnboardingStatus>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['dashboard-users', selectedUserType, selectedStatus, startDate, endDate],
    queryFn: async () => {
      console.log('Fetching users with filters:', { selectedUserType, selectedStatus, startDate, endDate });
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          user_type,
          onboarding_status,
          created_at
        `);

      if (selectedUserType !== "all") {
        query = query.eq('user_type', selectedUserType);
      }

      if (selectedStatus !== "all") {
        query = query.eq('onboarding_status', selectedStatus);
      }

      if (startDate) {
        query = query.gte('created_at', startOfDay(startDate).toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endOfDay(endDate).toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Fetched users:', data?.length);
      return data as User[];
    }
  });

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalMentors = users.filter(user => user.user_type === 'mentor').length;
    const totalMentees = users.filter(user => user.user_type === 'mentee').length;
    return { totalUsers, totalMentors, totalMentees };
  }, [users]);

  const handleUserTypeChange = async (userId: string, newType: UserType) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          user_type: newType,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User type updated",
        description: `User type has been updated to ${newType}`,
      });

      refetch();
    } catch (error) {
      console.error('Error updating user type:', error);
      toast({
        title: "Error",
        description: "Failed to update user type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: OnboardingStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `User status has been updated to ${newStatus}`,
      });

      refetch();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUserId(null);
  };

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  const columns = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => (
        <button 
          onClick={() => handleUserClick(row.original.id)}
          className="text-left hover:underline hover:text-primary"
        >
          {row.original.full_name || row.original.email}
        </button>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "user_type",
      header: "User Type",
      cell: ({ row }) => (
        <Select
          value={row.original.user_type}
          onValueChange={(value: UserType) => handleUserTypeChange(row.original.id, value)}
        >
          <SelectTrigger className={`w-[130px] ${userTypeColors[row.original.user_type]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mentor" className={userTypeColors.mentor}>Mentor</SelectItem>
            <SelectItem value="mentee" className={userTypeColors.mentee}>Mentee</SelectItem>
            <SelectItem value="admin" className={userTypeColors.admin}>Admin</SelectItem>
            <SelectItem value="editor" className={userTypeColors.editor}>Editor</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "onboarding_status",
      header: "Status",
      cell: ({ row }) => (
        <Select
          value={row.original.onboarding_status}
          onValueChange={(value: OnboardingStatus) => handleStatusChange(row.original.id, value)}
        >
          <SelectTrigger className={`w-[130px] ${statusColors[row.original.onboarding_status]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending" className={statusColors["Pending"]}>Pending</SelectItem>
            <SelectItem value="Under Review" className={statusColors["Under Review"]}>Under Review</SelectItem>
            <SelectItem value="Consent Signed" className={statusColors["Consent Signed"]}>Consent Signed</SelectItem>
            <SelectItem value="Approved" className={statusColors["Approved"]}>Approved</SelectItem>
            <SelectItem value="Rejected" className={statusColors["Rejected"]}>Rejected</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Users Management</h2>
              <div className="flex gap-4 text-sm">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <span className="font-semibold">Total Users:</span>
                  <span className="ml-2">{stats.totalUsers}</span>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <span className="font-semibold text-[#9b87f5]">Mentors:</span>
                  <span className="ml-2">{stats.totalMentors}</span>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <span className="font-semibold text-[#7E69AB]">Mentees:</span>
                  <span className="ml-2">{stats.totalMentees}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="mentor" className={userTypeColors.mentor}>Mentors</SelectItem>
                  <SelectItem value="mentee" className={userTypeColors.mentee}>Mentees</SelectItem>
                  <SelectItem value="admin" className={userTypeColors.admin}>Admins</SelectItem>
                  <SelectItem value="editor" className={userTypeColors.editor}>Editors</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending" className={statusColors["Pending"]}>Pending</SelectItem>
                  <SelectItem value="Under Review" className={statusColors["Under Review"]}>Under Review</SelectItem>
                  <SelectItem value="Consent Signed" className={statusColors["Consent Signed"]}>Consent Signed</SelectItem>
                  <SelectItem value="Approved" className={statusColors["Approved"]}>Approved</SelectItem>
                  <SelectItem value="Rejected" className={statusColors["Rejected"]}>Rejected</SelectItem>
                </SelectContent>
              </Select>

              <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
            </div>
            {users && <DataTable columns={columns} data={users} />}
          </Card>
        </TabsContent>
      </Tabs>

      <UserProfileDetailsDialog 
        userId={selectedUserId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
