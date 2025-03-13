
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
    <table class="w-full border-collapse my-2">
      <tr>
        <th class="border border-gray-300 px-2 py-1 bg-gray-100 font-medium text-left">Date</th>
        <td class="border border-gray-300 px-2 py-1">${sessionDate}</td>
      </tr>
      <tr>
        <th class="border border-gray-300 px-2 py-1 bg-gray-100 font-medium text-left">Time</th>
        <td class="border border-gray-300 px-2 py-1">${sessionTime}</td>
      </tr>
      <tr>
        <th class="border border-gray-300 px-2 py-1 bg-gray-100 font-medium text-left">Session Type</th>
        <td class="border border-gray-300 px-2 py-1">${sessionType}</td>
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
    <ul class="list-disc pl-4 my-2">
      <li class="mb-1">Connect with other members</li>
      <li class="mb-1">Access exclusive resources</li>
      <li class="mb-1">Participate in group discussions</li>
      <li class="mb-1">Stay updated on hub activities</li>
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
    <h3 class="text-base font-medium mb-2">${title}</h3>
    <p class="mb-2">${content}</p>
    <p class="text-sm italic text-gray-600">Posted by ${authorName}</p>
  `;
}
