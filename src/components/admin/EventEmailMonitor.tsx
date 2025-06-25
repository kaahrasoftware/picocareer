
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { EventEmailLog, getFailedEmails, retryFailedEmails, sendConfirmationEmail } from '@/utils/eventEmailUtils';
import { supabase } from '@/integrations/supabase/client';

export function EventEmailMonitor() {
  const [emailLogs, setEmailLogs] = useState<EventEmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('event_email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching email logs:', error);
        return;
      }

      setEmailLogs(data || []);
    } catch (error) {
      console.error('Error in fetchEmailLogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    setIsRetrying(true);
    try {
      const result = await retryFailedEmails();
      toast.success(`Retried emails: ${result.success} successful, ${result.failed} failed`);
      await fetchEmailLogs(); // Refresh the list
    } catch (error) {
      toast.error('Failed to retry emails');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRetrySingle = async (registrationId: string) => {
    try {
      const result = await sendConfirmationEmail(registrationId);
      if (result.success) {
        toast.success('Email sent successfully');
        await fetchEmailLogs();
      } else {
        toast.error(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const failedCount = emailLogs.filter(log => log.status === 'failed').length;
  const sentCount = emailLogs.filter(log => log.status === 'sent').length;
  const queuedCount = emailLogs.filter(log => log.status === 'queued').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Event Email Confirmations
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={fetchEmailLogs}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
            {failedCount > 0 && (
              <Button 
                onClick={handleRetryFailed}
                variant="outline"
                size="sm"
                disabled={isRetrying}
              >
                {isRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : `Retry Failed (${failedCount})`}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{sentCount}</div>
            <div className="text-sm text-gray-600">Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{queuedCount}</div>
            <div className="text-sm text-gray-600">Queued</div>
          </div>
        </div>

        {/* Email Logs List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-gray-600 mt-2">Loading email logs...</p>
            </div>
          ) : emailLogs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">No email logs found</p>
            </div>
          ) : (
            emailLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="font-medium">{log.email}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    {log.error_message && (
                      <div className="text-sm text-red-600 mt-1">
                        Error: {log.error_message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                  {log.status === 'failed' && (
                    <Button
                      onClick={() => handleRetrySingle(log.registration_id)}
                      size="sm"
                      variant="outline"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
