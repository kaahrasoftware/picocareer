
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailCampaignAnalytics {
  totalCampaigns: number;
  campaignsSent: number;
  totalReach: number;
  successRate: number;
  failedCampaigns: number;
  averageRecipientsPerCampaign: number;
  isLoading: boolean;
  error: string | null;
}

export function useEmailCampaignAnalytics(adminId: string): EmailCampaignAnalytics {
  const [analytics, setAnalytics] = useState<EmailCampaignAnalytics>({
    totalCampaigns: 0,
    campaignsSent: 0,
    totalReach: 0,
    successRate: 0,
    failedCampaigns: 0,
    averageRecipientsPerCampaign: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!adminId) return;

    const fetchAnalytics = async () => {
      try {
        setAnalytics(prev => ({ ...prev, isLoading: true, error: null }));

        const { data: campaigns, error } = await supabase
          .from('email_campaigns')
          .select('status, sent_count, failed_count, recipients_count')
          .eq('admin_id', adminId);

        if (error) throw error;

        const totalCampaigns = campaigns?.length || 0;
        const campaignsSent = campaigns?.filter(c => c.status === 'sent').length || 0;
        const totalSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
        const totalFailed = campaigns?.reduce((sum, c) => sum + (c.failed_count || 0), 0) || 0;
        const totalReach = campaigns?.reduce((sum, c) => sum + (c.recipients_count || 0), 0) || 0;
        const failedCampaigns = campaigns?.filter(c => c.status === 'failed').length || 0;

        const successRate = totalSent > 0 ? ((totalSent - totalFailed) / totalSent) * 100 : 0;
        const averageRecipientsPerCampaign = totalCampaigns > 0 ? totalReach / totalCampaigns : 0;

        setAnalytics({
          totalCampaigns,
          campaignsSent,
          totalReach,
          successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
          failedCampaigns,
          averageRecipientsPerCampaign: Math.round(averageRecipientsPerCampaign),
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching email campaign analytics:', err);
        setAnalytics(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load analytics',
        }));
      }
    };

    fetchAnalytics();
  }, [adminId]);

  return analytics;
}
