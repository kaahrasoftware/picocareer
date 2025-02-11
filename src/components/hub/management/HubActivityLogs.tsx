
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HubActivityLogsProps {
  hubId: string;
}

export function HubActivityLogs({ hubId }: HubActivityLogsProps) {
  // Fetch audit logs
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['hub-audit-logs', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_audit_logs')
        .select(`
          *,
          performed_by:profiles!hub_audit_logs_performed_by_fkey(
            id,
            first_name,
            last_name
          )
        `)
        .eq('hub_id', hubId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditLogs?.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-2 border rounded">
              <div className="flex-1">
                <p className="font-medium">
                  {log.performed_by?.first_name} {log.performed_by?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {log.action.replace(/_/g, ' ')}
                </p>
                {log.details && (
                  <pre className="mt-2 text-xs bg-muted p-2 rounded">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
