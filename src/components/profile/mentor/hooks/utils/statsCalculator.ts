
export function calculateSessionStats(sessions: any[], feedback: any[], now: Date) {
  const total_sessions = sessions.length;
  
  // Count completed sessions based on all criteria
  const completed_sessions = sessions.filter(s => {
    if (s.status === 'cancelled') return false;
    
    const sessionEndTime = new Date(s.scheduled_at);
    sessionEndTime.setMinutes(sessionEndTime.getMinutes() + (s.session_type?.duration || 60));
    
    if (sessionEndTime >= now) return false;
    
    const sessionFeedback = feedback.find(f => f.session_id === s.id);
    if (sessionFeedback?.did_not_show_up) return false;
    
    return s.status === 'completed';
  }).length;

  const upcoming_sessions = sessions.filter(s => {
    if (s.status === 'cancelled') return false;
    return new Date(s.scheduled_at) >= now;
  }).length;

  const cancelled_sessions = sessions.filter(s => s.status === 'cancelled').length;

  return {
    total_sessions,
    completed_sessions,
    upcoming_sessions,
    cancelled_sessions
  };
}

export function calculateTotalHours(sessions: any[], feedback: any[], now: Date): string {
  const totalMinutes = sessions.reduce((acc, session) => {
    if (session.status === 'cancelled') return acc;
    
    const sessionFeedback = feedback.find(f => f.session_id === session.id);
    if (sessionFeedback?.did_not_show_up) return acc;
    
    const startTime = new Date(session.scheduled_at);
    const endTime = new Date(session.scheduled_at);
    endTime.setMinutes(endTime.getMinutes() + (session.session_type?.duration || 60));
    
    if (endTime > now) return acc;
    
    const durationInMs = endTime.getTime() - startTime.getTime();
    const durationInMinutes = Math.floor(durationInMs / (1000 * 60));
    
    return acc + durationInMinutes;
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function calculateRatingStats(feedback: any[]) {
  const validRatings = feedback.filter(f => 
    !f.did_not_show_up && 
    f.rating > 0
  );
  const total_ratings = validRatings.length;
  const average_rating = total_ratings > 0
    ? validRatings.reduce((acc, curr) => acc + curr.rating, 0) / total_ratings
    : 0;

  return {
    total_ratings,
    average_rating: Number(average_rating.toFixed(1))
  };
}

export function calculateMonthlyStats(sessions: any[], feedback: any[]) {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      name: date.toLocaleString('default', { month: 'short' }),
      date: date,
      sessions: 0
    };
  }).reverse();

  return last6Months.map(month => {
    const count = sessions.filter(session => {
      if (session.status === 'cancelled') return false;
      
      const sessionFeedback = feedback.find(f => f.session_id === session.id);
      if (sessionFeedback?.did_not_show_up) return false;
      
      const sessionDate = new Date(session.scheduled_at);
      return sessionDate.getMonth() === month.date.getMonth() &&
             sessionDate.getFullYear() === month.date.getFullYear();
    }).length;
    return {
      name: month.name,
      sessions: count
    };
  });
}
