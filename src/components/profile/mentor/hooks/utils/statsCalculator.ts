
export function calculateSessionStats(sessions: any[], feedback: any[], now: Date) {
  const total_sessions = sessions.length;
  
  // Count completed sessions based on all criteria
  const completed_sessions = sessions.filter(s => {
    if (s.status === 'cancelled') return false;
    
    try {
      const sessionEndTime = new Date(s.scheduled_at);
      if (isNaN(sessionEndTime.getTime())) {
        console.error('Invalid scheduled_at date:', s.scheduled_at);
        return false;
      }
      
      sessionEndTime.setMinutes(sessionEndTime.getMinutes() + (s.session_type?.duration || 60));
      
      // Consider a session completed if:
      // 1. Status is 'completed' OR
      // 2. Session end time has passed and status is not cancelled
      if (sessionEndTime < now && s.status !== 'cancelled') {
        // Check if there's any no-show feedback
        const sessionFeedback = feedback.find(f => f.session_id === s.id);
        if (sessionFeedback?.did_not_show_up) return false;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error processing session:', error);
      return false;
    }
  }).length;

  const upcoming_sessions = sessions.filter(s => {
    if (s.status === 'cancelled') return false;
    try {
      const sessionDate = new Date(s.scheduled_at);
      if (isNaN(sessionDate.getTime())) {
        console.error('Invalid scheduled_at date:', s.scheduled_at);
        return false;
      }
      return sessionDate >= now;
    } catch (error) {
      console.error('Error processing upcoming session:', error);
      return false;
    }
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
    
    try {
      const startTime = new Date(session.scheduled_at);
      if (isNaN(startTime.getTime())) {
        console.error('Invalid scheduled_at date:', session.scheduled_at);
        return acc;
      }

      const endTime = new Date(session.scheduled_at);
      if (isNaN(endTime.getTime())) {
        console.error('Invalid scheduled_at date:', session.scheduled_at);
        return acc;
      }

      endTime.setMinutes(endTime.getMinutes() + (session.session_type?.duration || 60));
      
      if (endTime > now) return acc;
      
      const durationInMs = endTime.getTime() - startTime.getTime();
      const durationInMinutes = Math.floor(durationInMs / (1000 * 60));
      
      return acc + durationInMinutes;
    } catch (error) {
      console.error('Error calculating session duration:', error);
      return acc;
    }
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function calculateRatingStats(feedback: any[]) {
  const validRatings = feedback.filter(f => 
    !f.did_not_show_up && 
    typeof f.rating === 'number' &&
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
      
      try {
        const sessionDate = new Date(session.scheduled_at);
        if (isNaN(sessionDate.getTime())) {
          console.error('Invalid scheduled_at date:', session.scheduled_at);
          return false;
        }
        
        return sessionDate.getMonth() === month.date.getMonth() &&
               sessionDate.getFullYear() === month.date.getFullYear();
      } catch (error) {
        console.error('Error processing monthly session:', error);
        return false;
      }
    }).length;
    
    return {
      name: month.name,
      sessions: count
    };
  });
}
