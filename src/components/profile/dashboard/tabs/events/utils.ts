
import { format, formatDistance, isSameDay } from 'date-fns';

export type EventStatus = 'Pending' | 'Approved' | 'Rejected';

export const formatEventDate = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // If same day
  if (isSameDay(start, end)) {
    return `${format(start, 'MMM d, yyyy')} (${format(start, 'h:mm a')} - ${format(end, 'h:mm a')})`;
  }
  
  // Different days
  return `${format(start, 'MMM d, yyyy h:mm a')} - ${format(end, 'MMM d, yyyy h:mm a')}`;
};

export const getStatusBadgeInfo = (status: EventStatus) => {
  switch (status) {
    case 'Approved':
      return { variant: 'default' as const, label: 'Approved', className: 'bg-green-500' };
    case 'Pending':
      return { variant: 'outline' as const, label: 'Pending', className: 'text-amber-500' };
    case 'Rejected':
      return { variant: 'destructive' as const, label: 'Rejected', className: '' };
    default:
      return { variant: 'outline' as const, label: 'Unknown', className: '' };
  }
};

export const isEventUpcoming = (startDate: string) => {
  return new Date(startDate) > new Date();
};

export const getEventTimeLabel = (startDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  
  if (start < now) {
    return 'Past';
  }
  
  const distance = formatDistance(start, now, { addSuffix: true });
  return distance;
};
