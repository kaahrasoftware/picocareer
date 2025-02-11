
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, List, History, User, Calendar } from "lucide-react";
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

  const formatActionText = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getActionIcon = (action: string) => {
    if (action.includes('member')) return <User className="h-4 w-4" />;
    if (action.includes('resource')) return <List className="h-4 w-4" />;
    return <History className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditLogs?.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 border rounded bg-card hover:bg-accent/50 transition-colors">
              <div className="p-2 rounded-full bg-muted">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {log.performed_by?.first_name} {log.performed_by?.last_name}
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <p className="text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatActionText(log.action)}
                </p>
                {log.details && (
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}

          {auditLogs?.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No activity logs found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
