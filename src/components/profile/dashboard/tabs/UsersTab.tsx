import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UserType, OnboardingStatus, Degree } from "@/types/database/enums";
import { ColumnDef } from "@tanstack/react-table";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge } from "@/components/ui/badge";

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
  const { data: users, isLoading } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: async () => {
      const { data, error } = await supabase
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
            {users && <DataTable columns={columns} data={users} />}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}