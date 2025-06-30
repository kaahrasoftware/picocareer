
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { data: emailLogs, isLoading, refetch } = useQuery({
    queryKey: ['event-email-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as EmailLog[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleRetryFailed = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-email-queue');
      
      if (error) throw error;
      
      toast({
        title: "Processing Complete",
        description: `Processed ${data.processed} emails with ${data.errors} errors.`,
      });
      
      refetch();
    } catch (error: any) {
      console.error('Error processing email queue:', error);
      toast({
        title: "Error",
        description: "Failed to process email queue.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetrySpecific = async (registrationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('process-event-confirmations', {
        body: { registrationId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Email Resent",
        description: "Confirmation email has been queued for resending.",
      });
      
      refetch();
    } catch (error: any) {
      console.error('Error resending email:', error);
      toast({
        title: "Error",
        description: "Failed to resend email.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Mail className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      queued: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const stats = emailLogs ? {
    total: emailLogs.length,
    sent: emailLogs.filter(log => log.status === 'sent').length,
    failed: emailLogs.filter(log => log.status === 'failed').length,
    queued: emailLogs.filter(log => log.status === 'queued').length,
    processing: emailLogs.filter(log => log.status === 'processing').length,
  } : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Email Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Event Email Monitor
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryFailed}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Process Queue
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
              <div className="text-sm text-muted-foreground">Sent</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.queued}</div>
              <div className="text-sm text-muted-foreground">Queued</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </div>
          </div>
        )}

        {/* Email Logs */}
        <div className="space-y-3">
          {emailLogs && emailLogs.length > 0 ? (
            emailLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="font-medium">{log.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Created: {format(new Date(log.created_at), 'PPp')}
                      {log.sent_at && (
                        <span className="ml-2">
                          • Sent: {format(new Date(log.sent_at), 'PPp')}
                        </span>
                      )}
                    </div>
                    {log.error_message && (
                      <div className="text-sm text-red-600 mt-1">
                        Error: {log.error_message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusBadge(log.status)}>
                    {log.status}
                  </Badge>
                  {log.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetrySpecific(log.registration_id)}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No email logs found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
