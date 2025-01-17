import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UserType, OnboardingStatus, Degree } from "@/types/database/enums";
import { ColumnDef } from "@tanstack/react-table";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  user_type: UserType;
  onboarding_status: OnboardingStatus;
  school_id: string;
  academic_major_id: string;
  position: string;
  highest_degree: Degree;
  created_at: string;
};

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
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { toast } = useToast();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-users', selectedUserType, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          user_type,
          onboarding_status,
          school_id,
          academic_major_id,
          position,
          highest_degree,
          created_at
        `);

      if (selectedUserType !== "all") {
        query = query.eq('user_type', selectedUserType as UserType);
      }

      if (selectedStatus !== "all") {
        query = query.eq('onboarding_status', selectedStatus as OnboardingStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      return data as User[];
    }
  });

  // Calculate user statistics
  const totalUsers = users?.length || 0;
  const totalMentors = users?.filter(user => user.user_type === 'mentor').length || 0;
  const totalMentees = users?.filter(user => user.user_type === 'mentee').length || 0;

  const handleUserTypeChange = async (userId: string, newType: UserType) => {
    try {
      console.log('Updating user type:', { userId, newType });
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          user_type: newType,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, user_type')
        .single();

      if (error) {
        console.error('Error updating user type:', error);
        throw error;
      }

      if (!data) {
        console.error('No data returned after update');
        throw new Error('No data returned after update');
      }

      console.log('Update successful:', data);

      toast({
        title: "User type updated",
        description: `User type has been updated to ${newType}`,
      });

      refetch();
    } catch (error) {
      console.error('Detailed error updating user type:', error);
      toast({
        title: "Error",
        description: "Failed to update user type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: OnboardingStatus) => {
    try {
      console.log('Updating user status:', { userId, newStatus });
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, onboarding_status')
        .single();

      if (error) {
        console.error('Error updating user status:', error);
        throw error;
      }

      if (!data) {
        console.error('No data returned after update');
        throw new Error('No data returned after update');
      }

      console.log('Update successful:', data);

      toast({
        title: "Status updated",
        description: `User status has been updated to ${newStatus}`,
      });

      refetch();
    } catch (error) {
      console.error('Detailed error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "avatar_url",
      header: "Avatar",
      cell: ({ row }) => (
        <ProfileAvatar
          avatarUrl={row.original.avatar_url}
          size="sm"
          editable={false}
          profileId={row.original.id}
        />
      ),
    },
    {
      accessorKey: "full_name",
      header: "Name",
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
          <SelectTrigger className="w-[130px]">
            <SelectValue className={userTypeColors[row.original.user_type]} />
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
          <SelectTrigger className="w-[130px]">
            <SelectValue className={statusColors[row.original.onboarding_status]} />
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
      accessorKey: "highest_degree",
      header: "Degree",
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
                  <span className="ml-2">{totalUsers}</span>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <span className="font-semibold text-[#9b87f5]">Mentors:</span>
                  <span className="ml-2">{totalMentors}</span>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <span className="font-semibold text-[#7E69AB]">Mentees:</span>
                  <span className="ml-2">{totalMentees}</span>
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
            </div>
            {users && <DataTable columns={columns} data={users} />}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
