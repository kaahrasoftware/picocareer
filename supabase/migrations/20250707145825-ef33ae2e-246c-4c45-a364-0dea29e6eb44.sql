
-- Drop the triggers that automatically send notifications when careers/majors are approved
DROP TRIGGER IF EXISTS career_approval_notification_trigger ON careers;
DROP TRIGGER IF EXISTS major_approval_notification_trigger ON majors;

-- Drop the functions that handle the approval notifications
DROP FUNCTION IF EXISTS notify_career_approval();
DROP FUNCTION IF EXISTS notify_major_approval();

-- Also check for any similar triggers that might exist for status updates
DROP TRIGGER IF EXISTS career_status_notification_trigger ON careers;
DROP TRIGGER IF EXISTS major_status_notification_trigger ON majors;

-- Drop any related status notification functions
DROP FUNCTION IF EXISTS notify_career_status_change();
DROP FUNCTION IF EXISTS notify_major_status_change();
