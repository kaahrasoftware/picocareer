
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Refresh, Mail, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailLog {
  id: string;
  registration_id: string;
  email: string;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export function EventEmailMonitor() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchEmailLogs = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching email logs...');
      
      // Try the edge function first
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('get-event-email-logs');
      
      if (!edgeFunctionError && edgeFunctionData) {
        console.log('Edge function response:', edgeFunctionData);
        // Handle both direct array and wrapped response formats
        const logs = Array.isArray(edgeFunctionData) ? edgeFunctionData : edgeFunctionData.data || [];
        setEmailLogs(logs);
      } else {
        console.log('Edge function failed, querying table directly:', edgeFunctionError);
        
        // Fallback to direct table query
        const { data: tableData, error: tableError } = await supabase
          .from('event_email_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (tableError) {
          throw tableError;
        }

        console.log('Direct table query result:', tableData);
        setEmailLogs(tableData || []);
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retryFailedEmails = async () => {
    const failedLogs = emailLogs.filter(log => log.status === 'failed');
    
    if (failedLogs.length === 0) {
      toast({
        title: "Info",
        description: "No failed emails to retry",
      });
      return;
    }

    try {
      for (const log of failedLogs) {
        await supabase.functions.invoke('process-event-confirmations', {
          body: { registrationId: log.registration_id }
        });
      }
      
      toast({
        title: "Success", 
        description: `Retrying ${failedLogs.length} failed emails`,
      });
      
      // Refresh the logs after a short delay
      setTimeout(fetchEmailLogs, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry emails",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'failed': return 'destructive';
      case 'processing': return 'secondary';
      default: return 'outline';
    }
  };

  const statusCounts = emailLogs.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Monitoring
            </CardTitle>
            <CardDescription>
              Monitor event confirmation email delivery status
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={retryFailedEmails}
              disabled={isLoading || !emailLogs.some(log => log.status === 'failed')}
            >
              Retry Failed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEmailLogs}
              disabled={isLoading}
            >
              <Refresh className="h-4 w-4" />
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.sent || 0}</div>
              <div className="text-sm text-muted-foreground">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.failed || 0}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.processing || 0}</div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.queued || 0}</div>
              <div className="text-sm text-muted-foreground">Queued</div>
            </div>
          </div>

          {/* Email Logs */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {emailLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No email logs found</p>
              </div>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="font-medium">{log.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(log.status)}>
                      {log.status}
                    </Badge>
                    {log.error_message && (
                      <div className="text-xs text-red-500 max-w-xs truncate">
                        {log.error_message}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
