import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function UsersTab() {
  const { data: users } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*');
      return data || [];
    }
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Users Management</h2>
      {/* Add user management UI here */}
    </div>
  );
}