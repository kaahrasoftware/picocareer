
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface NotificationArgs {
  mentorName: string;
  menteeName: string;
  sessionType: string;
  scheduledAt?: Date;
}

export async function notifyAdmins({
  mentorName,
  menteeName,
  sessionType,
  scheduledAt
}: NotificationArgs): Promise<void> {
  try {
    const formattedDate = scheduledAt 
      ? format(scheduledAt, "PPp") 
      : 'No date specified';

    const { data: adminProfiles, error: adminsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_type', 'admin');

    if (adminsError) {
      console.error('Error fetching admin profiles:', adminsError);
      return;
    }

    if (!adminProfiles?.length) {
      console.warn('No admin profiles found to notify');
      return;
    }

    const notificationPromises = adminProfiles.map(admin => {
      return supabase
        .from('notifications')
        .insert({
          profile_id: admin.id,
          title: 'New Mentorship Session',
          message: `${menteeName} booked a ${sessionType} session with ${mentorName} for ${formattedDate}`,
          type: 'session_booked',
          category: 'session',
          action_url: '/admin/sessions'
        });
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error sending admin notifications:', error);
  }
}
