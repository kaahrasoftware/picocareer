
import { supabase } from "@/integrations/supabase/client";

export interface EventEmailLog {
  id: string;
  registration_id: string;
  email: string;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Manually trigger confirmation email for a specific registration
 */
export const sendConfirmationEmail = async (registrationId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Manually sending confirmation email for registration:', registrationId);
    
    const { data, error } = await supabase.functions.invoke('process-event-confirmations', {
      body: { registrationId }
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in sendConfirmationEmail:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get email logs for a specific registration
 */
export const getEmailLogs = async (registrationId: string): Promise<EventEmailLog[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-event-email-logs', {
      body: { registrationId }
    });

    if (error) {
      console.error('Error fetching email logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEmailLogs:', error);
    return [];
  }
};

/**
 * Get all failed email attempts that can be retried
 */
export const getFailedEmails = async (): Promise<EventEmailLog[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-event-email-logs', {});

    if (error) {
      console.error('Error fetching failed emails:', error);
      return [];
    }

    // Filter for failed emails
    const allLogs = data || [];
    return allLogs.filter((log: EventEmailLog) => log.status === 'failed');
  } catch (error) {
    console.error('Error in getFailedEmails:', error);
    return [];
  }
};

/**
 * Retry sending confirmation emails for failed attempts
 */
export const retryFailedEmails = async (): Promise<{ success: number; failed: number }> => {
  const failedEmails = await getFailedEmails();
  let successCount = 0;
  let failedCount = 0;

  for (const emailLog of failedEmails) {
    const result = await sendConfirmationEmail(emailLog.registration_id);
    if (result.success) {
      successCount++;
    } else {
      failedCount++;
    }
  }

  return { success: successCount, failed: failedCount };
};
