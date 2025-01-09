import { supabase } from "@/integrations/supabase/client";
import { NotificationType, NotificationCategory } from "@/types/notification";

export async function notifyAdmins(sessionDetails: {
  mentorName: string;
  menteeName: string;
  sessionType: string;
  scheduledAt: Date;
}) {
  try {
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_type', 'admin');

    if (!adminProfiles?.length) {
      console.log('No admin profiles found to notify');
      return;
    }

    const type: NotificationType = 'session_booked';
    const category: NotificationCategory = 'session';

    const notifications = adminProfiles.map(admin => ({
      profile_id: admin.id,
      title: 'New Session Booked',
      message: `${sessionDetails.menteeName} has booked a ${sessionDetails.sessionType} session with ${sessionDetails.mentorName} scheduled for ${sessionDetails.scheduledAt.toLocaleString()}.`,
      type,
      category,
      action_url: '/admin/sessions'
    }));

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error sending admin notifications:', notificationError);
      throw notificationError;
    }

    console.log('Admin notifications sent successfully');
  } catch (error) {
    console.error('Error in notifyAdmins:', error);
    throw error;
  }
}