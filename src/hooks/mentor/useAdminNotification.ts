
import { supabase } from "@/integrations/supabase/client";

export function useAdminNotification() {
  const sendAdminNotification = async (mentorData: any) => {
    try {
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'admin');

      if (!adminProfiles?.length) {
        console.warn('No admin profiles found to notify');
        return;
      }

      const notifications = adminProfiles.map(admin => ({
        profile_id: admin.id,
        title: 'New Mentor Application',
        message: `${mentorData.first_name} ${mentorData.last_name} has applied to become a mentor.`,
        type: 'mentor_request' as const,
        action_url: '/admin/mentors/pending'
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error sending admin notifications:', notificationError);
      }
    } catch (error) {
      console.error('Error in sendAdminNotification:', error);
    }
  };

  return { sendAdminNotification };
}
