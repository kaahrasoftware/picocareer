
/**
 * Generates HTML content for session booking notification
 * @param mentorName - Name of the mentor
 * @param sessionDate - Date of the session
 * @param sessionTime - Time of the session
 * @param sessionType - Type of the session
 * @returns Formatted HTML for session booking notification
 */
export function generateSessionBookingHtml(
  mentorName: string,
  sessionDate: string,
  sessionTime: string,
  sessionType: string
): string {
  return `
    <p>Your session with <strong>${mentorName}</strong> has been confirmed!</p>
    <table>
      <tr>
        <th>Date</th>
        <td>${sessionDate}</td>
      </tr>
      <tr>
        <th>Time</th>
        <td>${sessionTime}</td>
      </tr>
      <tr>
        <th>Session Type</th>
        <td>${sessionType}</td>
      </tr>
    </table>
    <p>Please make sure to prepare any questions or topics you'd like to discuss during the session.</p>
  `;
}

/**
 * Generates HTML content for hub invitation notification
 * @param hubName - Name of the hub
 * @param inviterName - Name of the person who sent the invitation
 * @returns Formatted HTML for hub invitation notification
 */
export function generateHubInvitationHtml(
  hubName: string,
  inviterName: string
): string {
  return `
    <p><strong>${inviterName}</strong> has invited you to join <strong>${hubName}</strong>!</p>
    <p>By joining this hub, you'll be able to:</p>
    <ul>
      <li>Connect with other members</li>
      <li>Access exclusive resources</li>
      <li>Participate in group discussions</li>
      <li>Stay updated on hub activities</li>
    </ul>
    <p>Use the buttons below to respond to this invitation.</p>
  `;
}

/**
 * Generates HTML content for announcement notification
 * @param title - Title of the announcement
 * @param content - Content of the announcement
 * @param authorName - Name of the author
 * @returns Formatted HTML for announcement notification
 */
export function generateAnnouncementHtml(
  title: string,
  content: string,
  authorName: string
): string {
  return `
    <h3>${title}</h3>
    <p>${content}</p>
    <p><em>Posted by ${authorName}</em></p>
  `;
}
