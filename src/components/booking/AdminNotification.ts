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
    for (const admin of adminProfiles) {
      await supabase
        .from('notifications')
        .insert({
          profile_id: admin.id,
          title: "New Session Booked",
          message: `${menteeName} booked a ${sessionType} session with ${mentorName} for ${scheduledAt.toLocaleString()}`,
          type: "session_booked" as NotificationType,
          category: "session" as NotificationCategory,
          action_url: `/calendar`
        });
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}