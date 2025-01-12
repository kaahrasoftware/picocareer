import { supabase } from "@/integrations/supabase/client";
import { NotificationType, NotificationCategory } from "@/types/session";

interface AdminNotificationProps {
  mentorName: string;
  menteeName: string;
  sessionType: string;
  scheduledAt: Date;
}

export async function notifyAdmins({
  mentorName,
  menteeName,
  sessionType,
  scheduledAt
}: AdminNotificationProps) {
  try {
    // Get all admin profiles
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_type', 'admin');

    if (!adminProfiles?.length) return;

    // Create notifications for each admin
    const notifications = adminProfiles.map(admin => ({
      profile_id: admin.id,
      title: "New Session Booked",
      message: `${menteeName} booked a ${sessionType} session with ${mentorName} for ${scheduledAt.toLocaleString()}`,
      type: "session_booked" as NotificationType,
      category: "session" as NotificationCategory,
      action_url: `/calendar`
    }));

    // Insert notifications one by one to match the expected type
    for (const notification of notifications) {
      await supabase
        .from('notifications')
        .insert(notification);
    }

  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}