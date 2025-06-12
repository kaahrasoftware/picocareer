
// This file is now deprecated - session booking logic has been moved to useSessionPayment.ts
// The new flow handles token deduction first, followed by session booking with proper rollback

export function useSessionBooking() {
  console.warn('useSessionBooking is deprecated. Use useSessionPayment instead.');
  
  return () => {
    throw new Error('useSessionBooking is deprecated. Use useSessionPayment instead.');
  };
}
