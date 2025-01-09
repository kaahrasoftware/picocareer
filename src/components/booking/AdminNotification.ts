import { supabase } from "@/integrations/supabase/client";
import { NotificationType } from "@/types/database/enums";

export async function notifyAdmins(sessionDetails: {
  mentorName: string;
  menteeName: string;
  sessionType: string;
  scheduledAt: Date;
}) {
  try {
    // Fetch all admin profiles
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_type', 'admin');

    if (!adminProfiles?.length) {
      console.log('No admin profiles found to notify');
      return;
    }

    // Create notifications for each admin
    const notifications = adminProfiles.map(admin => ({
      profile_id: admin.id,
      title: 'New Session Booked',
      message: `${sessionDetails.menteeName} has booked a ${sessionDetails.sessionType} session with ${sessionDetails.mentorName} scheduled for ${sessionDetails.scheduledAt.toLocaleString()}.`,
      type: 'session_booked' as NotificationType,
      action_url: '/admin/sessions',
      category: 'session' as const
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