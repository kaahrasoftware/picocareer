import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UserType, OnboardingStatus, Degree } from "@/types/database/enums";
import { ColumnDef } from "@tanstack/react-table";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

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
      <Badge variant="outline">{row.original.user_type}</Badge>
    ),
  },
  {
    accessorKey: "onboarding_status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.onboarding_status === "Approved" ? "default" : "secondary"}>
        {row.original.onboarding_status}
      </Badge>
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

export function UsersTab() {
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: users, isLoading } = useQuery({
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
        query = query.eq('user_type', selectedUserType);
      }

      if (selectedStatus !== "all") {
        query = query.eq('onboarding_status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card className="p-4">
            <h2 className="text-2xl font-bold mb-4">Users Management</h2>
            <div className="flex items-center gap-4 mb-4">
              <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="mentor">Mentors</SelectItem>
                  <SelectItem value="mentee">Mentees</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="editor">Editors</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Consent Signed">Consent Signed</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
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