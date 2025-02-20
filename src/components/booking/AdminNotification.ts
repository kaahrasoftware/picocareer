
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

    // Create notifications for each admin
    const notifications = adminProfiles.map(admin => ({
      profile_id: admin.id,
      title: "New Session Booking",
      message: `${menteeName} booked a ${sessionType} session with ${mentorName}${scheduledAt ? ` scheduled for ${scheduledAt.toLocaleDateString()}` : ''}`,
      type: "session_booked",
      category: "general"
    }));

    if (notifications.length > 0) {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifyError) throw notifyError;
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}
