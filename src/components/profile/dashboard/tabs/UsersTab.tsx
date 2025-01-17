import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Users } from "lucide-react";
import { ChartsTab } from "./ChartsTab";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "../users/columns";

export function UsersTab() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Users Management</h2>
      
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <Users className="h-4 w-4" />
            User List
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-2">
            <PieChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            {users && <DataTable columns={columns} data={users} />}
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <ChartsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}