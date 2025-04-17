
import { supabase } from "@/integrations/supabase/client";

interface NotifyParams {
  mentorName: string;
  menteeName: string;
  sessionType: string;
  scheduledAt?: Date;
}

export async function notifyAdmins({ mentorName, menteeName, sessionType, scheduledAt }: NotifyParams) {
  try {
    // Fetch admin users
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_type', 'admin');

    if (adminError) throw adminError;

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log('No admin profiles found to notify');
      return;
    }

    // Create notifications for each admin
    for (const admin of adminProfiles) {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert({
          profile_id: admin.id,
          title: "New Session Booking",
          message: `${menteeName} booked a ${sessionType} session with ${mentorName}${scheduledAt ? ` scheduled for ${scheduledAt.toLocaleDateString()}` : ''}`,
          type: "session_booked",
          category: "general"
        });

      if (notifyError) {
        console.error('Error notifying admin:', notifyError);
      }
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}
